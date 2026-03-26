const { Op } = require("sequelize");
const {
  Family,
  PregnantMother,
  LactatingMother,
  Child,
  AdministrativeUnit,
  UserAssignment,
  User,
} = require("../models");
const sequelize = require("../config/database");
const { AppError } = require("../middlewares/errorMiddleware");

const createFamilyService = async (familyData, user) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      block_id,
      registration_number,
      house_number,
      head_of_household_name,
      phone_number,
      is_vulnerable,
      is_safetynet_beneficiary,
      health_insurance_type,
      is_temporary_direct_support_beneficiary,
      latitude,
      longitude,
      guardian_name,
      guardian_gender,
      guardian_dob,
      guardian_phone_number,
      pregnant_mother,
      lactating_mother,
      children,
    } = familyData;

    // 1. Verify Block Exists and Jurisdiction
    const block = await AdministrativeUnit.findOne({
      where: { id: block_id, level: "BLOCK" },
      transaction,
    });

    if (!block) {
      throw new AppError("errors.block_not_found", 404);
    }

    // --- Jurisdiction Check ---
    if (user.role.name === "PC_WORKER") {
      // PC Workers are assigned directly to Blocks.
      // We must ensure the block_id they provided is one of their assigned units.
      const assignment = await UserAssignment.findOne({
        where: { user_id: user.id, unit_id: block_id },
        transaction,
      });

      if (!assignment) {
        throw new AppError("errors.pc_worker_unauthorized_block", 403);
      }
    } else {
      // Regular Health Center Admin logic:
      // We must verify if this block ultimately belongs to the user's Health Center
      // Block -> Ketena -> Woreda -> Health Center
      const ketena = await AdministrativeUnit.findOne({
        where: { id: block.parent_id, level: "KETENA" },
        transaction,
      });
      if (!ketena) throw new AppError("errors.block_not_found", 404);

      const woreda = await AdministrativeUnit.findOne({
        where: {
          id: ketena.parent_id,
          level: "WOREDA",
          parent_id: user.unit.id,
        },
        transaction,
      });
      if (!woreda) throw new AppError("errors.block_not_found", 404); // Not in their jurisdiction
    }

    // 2. Check for Duplicate Registration Number or Phone Number
    const existingRegistration = await Family.findOne({
      where: { registration_number },
      transaction,
    });

    if (existingRegistration) {
      throw new AppError("errors.registration_number_exists", 400);
    }

    if (phone_number) {
      const existingPhone = await Family.findOne({
        where: { phone_number },
        transaction,
      });

      if (existingPhone) {
        throw new AppError("errors.phone_number_exists", 400);
      }
    }

    // 3. Create the Family core record
    const newFamily = await Family.create(
      {
        block_id,
        registration_number,
        house_number,
        head_of_household_name,
        phone_number,
        is_vulnerable,
        is_safetynet_beneficiary,
        health_insurance_type,
        is_temporary_direct_support_beneficiary,
        latitude,
        longitude,
        guardian_name,
        guardian_gender,
        guardian_dob,
        guardian_phone_number,
        created_by: user.id,
      },
      { transaction },
    );

    // 4. Create Pregnant Mother if provided
    if (pregnant_mother) {
      await PregnantMother.create(
        {
          family_id: newFamily.id,
          name: pregnant_mother.name,
          dob: pregnant_mother.dob,
        },
        { transaction },
      );
    }

    // 5. Create Lactating Mother if provided
    if (lactating_mother) {
      await LactatingMother.create(
        {
          family_id: newFamily.id,
          name: lactating_mother.name,
          dob: lactating_mother.dob,
        },
        { transaction },
      );
    }

    // 6. Create Children if provided
    if (children && children.length > 0) {
      const childrenData = children.map((child) => ({
        family_id: newFamily.id,
        name: child.name,
        gender: child.gender,
        dob: child.dob,
        vulnerable_to_growth_restriction:
          child.vulnerable_to_growth_restriction || false,
      }));

      await Child.bulkCreate(childrenData, { transaction });
    }

    await transaction.commit();

    return newFamily;
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) throw error;
    console.error("Family Creation Error:", error);
    throw new AppError("errors.create_family_error", 500);
  }
};

const updateFamilyService = async (familyId, familyData, user) => {
  const transaction = await sequelize.transaction();

  try {
    const family = await Family.findOne({
      where: { id: familyId },
      transaction,
    });
    if (!family) {
      throw new AppError("errors.family_not_found", 404);
    }

    // --- Jurisdiction Check ---
    if (user.role.name === "PC_WORKER") {
      // PC Workers can only update families in their assigned blocks
      const assignment = await UserAssignment.findOne({
        where: { user_id: user.id, unit_id: family.block_id },
        transaction,
      });

      if (!assignment) {
        throw new AppError("errors.family_not_found", 404); // Or a more specific permission error
      }

      // If they are attempting to move the family to a new block, verify the new block is also in their jurisdiction
      if (familyData.block_id && familyData.block_id !== family.block_id) {
        const newBlockAssignment = await UserAssignment.findOne({
          where: { user_id: user.id, unit_id: familyData.block_id },
          transaction,
        });
        if (!newBlockAssignment) {
          throw new AppError("errors.pc_worker_unauthorized_block", 403);
        }
      }
    } else {
      // Regular Health Center Admin logic:
      // Ensure the Health Center admin still has rights to this family's original block
      const block = await AdministrativeUnit.findOne({
        where: { id: family.block_id, level: "BLOCK" },
        transaction,
      });
      if (!block) throw new AppError("errors.family_not_found", 404);

      const ketena = await AdministrativeUnit.findOne({
        where: { id: block.parent_id, level: "KETENA" },
        transaction,
      });
      const woreda = await AdministrativeUnit.findOne({
        where: {
          id: ketena.parent_id,
          level: "WOREDA",
          parent_id: user.unit.id,
        },
        transaction,
      });

      if (!woreda) {
        throw new AppError("errors.family_not_found", 404); // Outside jurisdiction
      }

      // If they are attempting to move the family to a new block, verify the new block is also in jurisdiction
      if (familyData.block_id && familyData.block_id !== family.block_id) {
        const newBlock = await AdministrativeUnit.findOne({
          where: { id: familyData.block_id, level: "BLOCK" },
          transaction,
        });
        if (!newBlock) throw new AppError("errors.block_not_found", 404);

        const newKetena = await AdministrativeUnit.findOne({
          where: { id: newBlock.parent_id, level: "KETENA" },
          transaction,
        });
        const newWoreda = await AdministrativeUnit.findOne({
          where: {
            id: newKetena.parent_id,
            level: "WOREDA",
            parent_id: user.unit.id,
          },
          transaction,
        });
        if (!newWoreda) throw new AppError("errors.block_not_found", 404);
      }
    }

    // --- Duplicates Check ---
    const { Op } = require("sequelize");

    // 1. Check duplicate registration_number
    if (
      familyData.registration_number &&
      familyData.registration_number !== family.registration_number
    ) {
      const existingReg = await Family.findOne({
        where: {
          registration_number: familyData.registration_number,
          id: { [Op.ne]: familyId },
        },
        transaction,
      });
      if (existingReg)
        throw new AppError("errors.registration_number_exists", 400);
    }

    // 2. Check duplicate phone_number
    if (
      familyData.phone_number &&
      familyData.phone_number !== family.phone_number
    ) {
      const existingPhone = await Family.findOne({
        where: {
          phone_number: familyData.phone_number,
          id: { [Op.ne]: familyId },
        },
        transaction,
      });
      if (existingPhone) throw new AppError("errors.phone_number_exists", 400);
    }

    // Update core family record (excluding nested relations)
    const coreUpdateData = { ...familyData };
    delete coreUpdateData.pregnant_mother;
    delete coreUpdateData.lactating_mother;
    delete coreUpdateData.children;

    await family.update(coreUpdateData, { transaction });

    // Update Pregnant Mother dynamically
    if (familyData.pregnant_mother !== undefined) {
      await PregnantMother.destroy({
        where: { family_id: familyId },
        transaction,
      });
      if (familyData.pregnant_mother !== null) {
        await PregnantMother.create(
          {
            family_id: familyId,
            name: familyData.pregnant_mother.name,
            dob: familyData.pregnant_mother.dob,
          },
          { transaction },
        );
      }
    }

    // Update Lactating Mother dynamically
    if (familyData.lactating_mother !== undefined) {
      await LactatingMother.destroy({
        where: { family_id: familyId },
        transaction,
      });
      if (familyData.lactating_mother !== null) {
        await LactatingMother.create(
          {
            family_id: familyId,
            name: familyData.lactating_mother.name,
            dob: familyData.lactating_mother.dob,
          },
          { transaction },
        );
      }
    }

    // Update Children dynamically
    if (familyData.children !== undefined) {
      await Child.destroy({ where: { family_id: familyId }, transaction });
      if (familyData.children !== null && familyData.children.length > 0) {
        const childrenData = familyData.children.map((child) => ({
          family_id: familyId,
          name: child.name,
          gender: child.gender,
          dob: child.dob,
          vulnerable_to_growth_restriction:
            child.vulnerable_to_growth_restriction || false,
        }));
        await Child.bulkCreate(childrenData, { transaction });
      }
    }

    await transaction.commit();
    return family;
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) throw error;
    console.error("Family Update Error:", error);
    throw new AppError("errors.update_family_error", 500);
  }
};

const deleteFamilyService = async (familyId, user) => {
  const transaction = await sequelize.transaction();

  try {
    const family = await Family.findOne({
      where: { id: familyId },
      transaction,
    });
    if (!family) {
      throw new AppError("errors.family_not_found", 404);
    }

    // --- Jurisdiction / Ownership Check ---
    if (user.role.name === "PC_WORKER") {
      // PC Workers can only delete families they personally created
      if (family.created_by !== user.id) {
        throw new AppError("errors.delete_family_unauthorized", 403);
      }
    } else {
      // Regular Health Center Admin logic:
      // Ensure the family is in their jurisdiction (using its current block)
      const block = await AdministrativeUnit.findOne({
        where: { id: family.block_id, level: "BLOCK" },
        transaction,
      });
      if (!block) throw new AppError("errors.family_not_found", 404);

      const ketena = await AdministrativeUnit.findOne({
        where: { id: block.parent_id, level: "KETENA" },
        transaction,
      });
      const woreda = await AdministrativeUnit.findOne({
        where: {
          id: ketena.parent_id,
          level: "WOREDA",
          parent_id: user.unit.id,
        },
        transaction,
      });

      if (!woreda) {
        throw new AppError("errors.delete_family_unauthorized", 403);
      }
    }

    // --- Soft Delete Family and its Dependents ---
    // (Assuming PregnantMother, LactatingMother, and Child all have paranoid: true in their models)
    await PregnantMother.destroy({
      where: { family_id: familyId },
      transaction,
    });
    await LactatingMother.destroy({
      where: { family_id: familyId },
      transaction,
    });
    await Child.destroy({ where: { family_id: familyId }, transaction });
    await family.destroy({ transaction });

    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) throw error;
    console.error("Family Deletion Error:", error);
    throw new AppError("errors.delete_family_error", 500);
  }
};

const getFamilyByIdService = async (familyId, user) => {
  try {
    const family = await Family.findOne({
      where: { id: familyId },
      include: [
        { model: PregnantMother },
        { model: LactatingMother },
        { model: Child },
      ],
    });

    if (!family) {
      throw new AppError("errors.family_not_found", 404);
    }

    // --- Jurisdiction Check ---
    if (user.role.name === "PC_WORKER") {
      // PC Workers can only access families in their assigned blocks
      const assignment = await UserAssignment.findOne({
        where: { user_id: user.id, unit_id: family.block_id },
      });

      if (!assignment) {
        throw new AppError("errors.family_not_found", 404);
      }
    } else {
      // Regular Health Center Admin logic:
      // Ensure the family is in their jurisdiction (using its current block)
      const block = await AdministrativeUnit.findOne({
        where: { id: family.block_id, level: "BLOCK" },
      });
      if (!block) throw new AppError("errors.family_not_found", 404);

      const ketena = await AdministrativeUnit.findOne({
        where: { id: block.parent_id, level: "KETENA" },
      });
      if (!ketena) throw new AppError("errors.family_not_found", 404);

      const woreda = await AdministrativeUnit.findOne({
        where: {
          id: ketena.parent_id,
          level: "WOREDA",
          parent_id: user.unit.id,
        },
      });

      if (!woreda) {
        throw new AppError("errors.family_not_found", 404);
      }
    }

    return family;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Fetch Family Error:", error);
    throw new AppError("errors.internal_error", 500);
  }
};

const getFamiliesByCreatorService = async (creatorId, page, limit, user) => {
  try {
    const offset = (page - 1) * limit;

    // Fetch families created by the specific user
    const { count, rows } = await Family.findAndCountAll({
      where: { created_by: creatorId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    return {
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
      families: rows,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Fetch Families by Creator Error:", error);
    throw new AppError("errors.internal_error", 500);
  }
};

const getFamiliesByAdminUnitService = async (filters, page, limit, user) => {
  try {
    const {
      block_id,
      ketena_id,
      woreda_id,
      health_center_id,
      subcity_id,
      city_id,
      is_vulnerable,
      pc_worker_id,
      search,
    } = filters;
    const offset = (page - 1) * limit;

    let whereCondition = {};

    // Apply search filter if provided
    if (search) {
      whereCondition[Op.or] = [
        { head_of_household_name: { [Op.iLike]: `%${search}%` } },
        { registration_number: { [Op.iLike]: `%${search}%` } },
        { phone_number: { [Op.iLike]: `%${search}%` } },
      ];
    }
    
    // Apply vulnerability filter if provided
    if (is_vulnerable !== undefined && is_vulnerable !== null && is_vulnerable !== "all") {
      whereCondition.is_vulnerable = is_vulnerable === "true" || is_vulnerable === true;
    }

    // If pc_worker_id filter is set, filter by creator
    if (pc_worker_id) {
      whereCondition.created_by = pc_worker_id;
    }

    const { level: userLevel, id: userUnitId } = user.unit;

    // Check if any specific administrative filter is provided
    const hasAdminFilter =
      block_id ||
      ketena_id ||
      woreda_id ||
      health_center_id ||
      subcity_id ||
      city_id ||
      pc_worker_id;

    // If no filters provided, default to user's assigned level
    let effectiveBlockId = block_id;
    let effectiveKetenaId = ketena_id;
    let effectiveWoredaId = woreda_id;
    let effectiveHealthCenterId = health_center_id;
    let effectiveSubcityId = subcity_id;
    let effectiveCityId = city_id;

    if (!hasAdminFilter) {
      if (userLevel === "BLOCK") effectiveBlockId = userUnitId;
      else if (userLevel === "KETENA") effectiveKetenaId = userUnitId;
      else if (userLevel === "WOREDA") effectiveWoredaId = userUnitId;
      else if (userLevel === "HEALTH_CENTER") effectiveHealthCenterId = userUnitId;
      else if (userLevel === "SUBCITY") effectiveSubcityId = userUnitId;
      else if (userLevel === "CITY") effectiveCityId = userUnitId;
    }

    let blockInclude = {
      model: AdministrativeUnit,
      as: "Block",
      required: !!(
        effectiveBlockId ||
        effectiveKetenaId ||
        effectiveWoredaId ||
        effectiveHealthCenterId ||
        effectiveSubcityId ||
        effectiveCityId
      ),
      include: [
        {
          model: AdministrativeUnit,
          as: "ParentUnit", // Ketena
          include: [
            {
              model: AdministrativeUnit,
              as: "ParentUnit", // Woreda
            },
          ],
        },
      ],
    };

    // Waterfall Logic: Priority from most specific (Block) to least specific (City)
    if (effectiveBlockId) {
      whereCondition.block_id = effectiveBlockId;
    } else if (effectiveKetenaId) {
      blockInclude.where = { parent_id: effectiveKetenaId };
    } else if (effectiveWoredaId) {
      blockInclude.include = [
        {
          model: AdministrativeUnit,
          as: "ParentUnit", // Ketena
          where: { parent_id: effectiveWoredaId },
          required: true,
        },
      ];
    } else if (effectiveHealthCenterId) {
      blockInclude.include = [
        {
          model: AdministrativeUnit,
          as: "ParentUnit", // Ketena
          required: true,
          include: [
            {
              model: AdministrativeUnit,
              as: "ParentUnit", // Woreda
              where: { parent_id: effectiveHealthCenterId },
              required: true,
            },
          ],
        },
      ];
    } else if (effectiveSubcityId) {
      blockInclude.include = [
        {
          model: AdministrativeUnit,
          as: "ParentUnit", // Ketena
          required: true,
          include: [
            {
              model: AdministrativeUnit,
              as: "ParentUnit", // Woreda
              required: true,
              include: [
                {
                  model: AdministrativeUnit,
                  as: "ParentUnit", // Health Center
                  where: { parent_id: effectiveSubcityId },
                  required: true,
                },
              ],
            },
          ],
        },
      ];
    } else if (effectiveCityId) {
      blockInclude.include = [
        {
          model: AdministrativeUnit,
          as: "ParentUnit", // Ketena
          required: true,
          include: [
            {
              model: AdministrativeUnit,
              as: "ParentUnit", // Woreda
              required: true,
              include: [
                {
                  model: AdministrativeUnit,
                  as: "ParentUnit", // Health Center
                  required: true,
                  include: [
                    {
                      model: AdministrativeUnit,
                      as: "ParentUnit", // Subcity
                      where: { parent_id: effectiveCityId },
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
    }

    const { count, rows } = await Family.findAndCountAll({
      where: whereCondition,
      include: [
        blockInclude,
        {
          model: User,
          as: "Creator",
          attributes: ["user_id", "first_name", "last_name"],
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    // Aggregate counts for stats (scoped to the current filters)
    const vulnerable_count = await Family.count({
      where: { ...whereCondition, is_vulnerable: true },
      include: [blockInclude],
      distinct: true,
    });

    const safety_net_count = await Family.count({
      where: { ...whereCondition, is_safetynet_beneficiary: true },
      include: [blockInclude],
      distinct: true,
    });

    const pc_workers = await Family.findAll({
      where: whereCondition,
      include: [blockInclude],
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("Family.created_by")), "created_by"],
      ],
      raw: true,
    });

    return {
      total: count,
      vulnerable_count,
      safety_net_count,
      pc_worker_count: pc_workers.length,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
      families: rows,
    };
  } catch (error) {
    console.error("Fetch Families by Admin Unit Error:", error);
    throw new AppError("errors.internal_error", 500);
  }
};

const getAssignedFamiliesService = async (user, page, limit) => {
  try {
    const offset = (page - 1) * limit;

    // Find all unit assignments for this user
    const assignments = await UserAssignment.findAll({
      where: { user_id: user.id },
      attributes: ["unit_id"],
    });

    const assignedUnitIds = assignments.map((a) => a.unit_id);

    if (assignedUnitIds.length === 0) {
      return {
        total: 0,
        pages: 0,
        currentPage: parseInt(page),
        limit: parseInt(limit),
        families: [],
      };
    }

    // Fetch families in those specific blocks
    const { count, rows } = await Family.findAndCountAll({
      where: { block_id: assignedUnitIds },
      include: [
        {
          model: AdministrativeUnit,
          as: "Block",
          include: [
            {
              model: AdministrativeUnit,
              as: "ParentUnit", // Ketena
              include: [
                {
                  model: AdministrativeUnit,
                  as: "ParentUnit", // Woreda
                },
              ],
            },
          ],
        },
        { model: PregnantMother },
        { model: LactatingMother },
        { model: Child },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    return {
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
      families: rows,
    };
  } catch (error) {
    console.error("Fetch Assigned Families Error:", error);
    throw new AppError("errors.internal_error", 500);
  }
};

module.exports = {
  createFamilyService,
  updateFamilyService,
  deleteFamilyService,
  getFamilyByIdService,
  getFamiliesByCreatorService,
  getFamiliesByAdminUnitService,
  getAssignedFamiliesService,
};
