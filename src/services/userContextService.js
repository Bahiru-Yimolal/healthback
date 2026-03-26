const { AdministrativeUnit, UserAssignment, Role } = require("../models");
const { AppError } = require("../middlewares/errorMiddleware");

// Level order from lowest to highest
const LEVEL_ORDER = [
  "BLOCK",
  "KETENA",
  "WOREDA",
  "HEALTH_CENTER",
  "SUBCITY",
  "CITY",
  "ETHIOPIA",
];

/**
 * Walks up the tree from a given unit, building the location path.
 * Returns map of { CITY: {...}, SUBCITY: {...}, HEALTH_CENTER: {...}, etc. }
 */
const buildLocationPath = async (unit) => {
  const path = {};
  let current = unit;

  while (current) {
    path[current.level] = { id: current.id, name: current.name };
    if (!current.parent_id) break;
    current = await AdministrativeUnit.findOne({
      where: { id: current.parent_id },
      attributes: ["id", "name", "level", "parent_id"],
    });
  }

  return path;
};

/**
 * GET /users/me/context
 * Returns the user's position in the hierarchy (their location path only).
 */
const getUserContextService = async (user) => {
  try {
    if (!user.unit) {
      throw new AppError("errors.user_not_assigned", 400);
    }

    const locationPath = await buildLocationPath(user.unit);

    // --- Build assigned_units tree ---
    const assignments = await UserAssignment.findAll({
      where: { user_id: user.id },
      include: [
        {
          model: AdministrativeUnit,
          attributes: ["id", "name", "level", "parent_id"],
          include: {
            model: AdministrativeUnit,
            as: "ParentUnit",
            attributes: ["id", "name", "level", "parent_id"],
            include: {
              model: AdministrativeUnit,
              as: "ParentUnit",
              attributes: ["id", "name", "level", "parent_id"],
            },
          },
        },
      ],
    });

    const woredasMap = new Map();

    for (const a of assignments) {
      const unit = a.AdministrativeUnit;
      if (unit && unit.level === "BLOCK") {
        const ketena = unit.ParentUnit;
        if (!ketena) continue;
        const woreda = ketena.ParentUnit;
        if (!woreda) continue;

        if (!woredasMap.has(woreda.id)) {
          woredasMap.set(woreda.id, {
            wereda_id: woreda.id,
            name: woreda.name,
            ketenas: new Map(),
          });
        }

        const woredaData = woredasMap.get(woreda.id);
        if (!woredaData.ketenas.has(ketena.id)) {
          woredaData.ketenas.set(ketena.id, {
            ketena_id: ketena.id,
            name: ketena.name,
            blocks: [],
          });
        }

        const ketenaData = woredaData.ketenas.get(ketena.id);
        if (!ketenaData.blocks.some((b) => b.block_id === unit.id)) {
          ketenaData.blocks.push({
            block_id: unit.id,
            name: unit.name,
          });
        }
      }
    }

    const assignedUnits = Array.from(woredasMap.values()).map((w) => ({
      ...w,
      ketenas: Array.from(w.ketenas.values()),
    }));

    return {
      user_id: user.id,
      role: user.role?.name || "Unknown",
      level: user.unit.level,
      location_path: locationPath,
      assigned_units: assignedUnits,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("getUserContextService error:", error);
    throw new AppError("errors.internal_error", 500);
  }
};

/**
 * Recursively fetches all SubUnits for a given unit down to the target depth.
 */
const fetchSubUnits = async (unitId, levelsToFetch) => {
  if (!levelsToFetch.length) return [];

  const children = await AdministrativeUnit.findAll({
    where: { parent_id: unitId },
    attributes: ["id", "name", "level"],
    order: [["name", "ASC"]],
  });

  if (!children.length) return [];

  // For each child, recursively fetch their children if needed
  const results = await Promise.all(
    children.map(async (child) => {
      const childObj = { id: child.id, name: child.name, level: child.level };
      const remainingLevels = levelsToFetch.filter((l) => l !== child.level);
      if (remainingLevels.length > 0) {
        const subKey =
          child.level === "WOREDA"
            ? "ketenas"
            : child.level === "KETENA"
              ? "blocks"
              : child.level === "HEALTH_CENTER"
                ? "woredas"
                : child.level === "SUBCITY"
                  ? "health_centers"
                  : child.level === "CITY"
                    ? "subcities"
                    : null;

        if (subKey) {
          childObj[subKey] = await fetchSubUnits(child.id, remainingLevels);
        }
      }
      return childObj;
    }),
  );

  return results;
};

/**
 * GET /users/me/hierarchy
 * Returns the full nested tree accessible to this user, auto-scoped to their level.
 */
const getUserHierarchyService = async (user) => {
  try {
    if (!user.unit) {
      throw new AppError("errors.user_not_assigned", 400);
    }

    const { level, id: unitId, name: unitName } = user.unit;

    // Define what levels sit below the user
    const ALL_LEVELS_BELOW = {
      ETHIOPIA: [
        "CITY",
        "SUBCITY",
        "HEALTH_CENTER",
        "WOREDA",
        "KETENA",
        "BLOCK",
      ],
      CITY: ["SUBCITY", "HEALTH_CENTER", "WOREDA", "KETENA", "BLOCK"],
      SUBCITY: ["HEALTH_CENTER", "WOREDA", "KETENA", "BLOCK"],
      HEALTH_CENTER: ["WOREDA", "KETENA", "BLOCK"],
      WOREDA: ["KETENA", "BLOCK"],
      KETENA: ["BLOCK"],
      BLOCK: [],
    };

    const levelsBelow = ALL_LEVELS_BELOW[level] || [];

    // PC_WORKER is a special case — they're assigned to specific blocks, not a single parent unit
    const roleName = user.role?.name;
    if (roleName === "PC_WORKER") {
      const assignments = await UserAssignment.findAll({
        where: { user_id: user.id },
        include: [
          {
            model: AdministrativeUnit,
            foreignKey: "unit_id",
            attributes: ["id", "name", "level"],
          },
        ],
      });

      const blocks = assignments.map((a) => ({
        id: a.AdministrativeUnit.id,
        name: a.AdministrativeUnit.name,
        level: a.AdministrativeUnit.level,
      }));

      return { level, unit: { id: unitId, name: unitName }, blocks };
    }

    // Build the nested subtree starting from the user's unit
    const subKey =
      level === "CITY"
        ? "subcities"
        : level === "SUBCITY"
          ? "health_centers"
          : level === "HEALTH_CENTER"
            ? "woredas"
            : level === "WOREDA"
              ? "ketenas"
              : level === "KETENA"
                ? "blocks"
                : null;

    const rootNode = { id: unitId, name: unitName, level };

    if (subKey && levelsBelow.length > 0) {
      rootNode[subKey] = await fetchSubUnits(unitId, levelsBelow);
    }

    // For ETHIOPIA level, fetch all cities as the top level
    if (level === "ETHIOPIA") {
      const cities = await AdministrativeUnit.findAll({
        where: { level: "CITY" },
        attributes: ["id", "name", "level"],
        order: [["name", "ASC"]],
      });

      const citiesWithChildren = await Promise.all(
        cities.map(async (city) => ({
          id: city.id,
          name: city.name,
          level: city.level,
          subcities: await fetchSubUnits(city.id, [
            "SUBCITY",
            "HEALTH_CENTER",
            "WOREDA",
            "KETENA",
            "BLOCK",
          ]),
        })),
      );

      return { level, cities: citiesWithChildren };
    }

    return { level, unit: rootNode };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("getUserHierarchyService error:", error);
    throw new AppError("errors.internal_error", 500);
  }
};

module.exports = {
  getUserContextService,
  getUserHierarchyService,
};
