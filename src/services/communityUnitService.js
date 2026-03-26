const { AppError } = require("../middlewares/errorMiddleware");
const AdministrativeUnit = require("../models/administrativeUnitModel");
const { User, Role, UserAssignment } = require("../models");
const { Op } = require("sequelize");

const createWoredaService = async (name, user) => {
    try {
        // Check for duplicate woreda under the same health center
        const existingWoreda = await AdministrativeUnit.findOne({
            where: { name, level: "WOREDA", parent_id: user.unit.id },
        });

        if (existingWoreda) {
            throw new AppError("errors.woreda_exists", 400);
        }

        // Create the woreda
        const newWoreda = await AdministrativeUnit.create({
            name,
            level: "WOREDA",
            parent_id: user.unit.id, // Health Center unit id
        });

        return newWoreda;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("errors.internal_error", 500);
    }
};

const listWoredasService = async (user) => {
    try {
        // Fetch Woredas under the Health Center of the user making the request
        const woredas = await AdministrativeUnit.findAll({
            where: { level: "WOREDA", parent_id: user.unit.id },
        });

        return woredas;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("errors.fetch_woredas_error", 500);
    }
};

const updateWoredaService = async (woredaId, name, user) => {
    try {
        const woreda = await AdministrativeUnit.findOne({
            where: { id: woredaId, level: "WOREDA", parent_id: user.unit.id },
        });

        if (!woreda) throw new AppError("errors.woreda_not_found", 404);

        // Check for duplicate name under the same Health Center
        const duplicate = await AdministrativeUnit.findOne({
            where: { name, level: "WOREDA", parent_id: user.unit.id, id: { [Op.ne]: woredaId } },
        });

        if (duplicate) throw new AppError("errors.woreda_exists", 400);

        woreda.name = name;
        await woreda.save();

        return woreda;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("errors.internal_error", 500);
    }
};

const deleteWoredaService = async (woredaId, user) => {
    try {
        const woreda = await AdministrativeUnit.findOne({
            where: { id: woredaId, level: "WOREDA", parent_id: user.unit.id },
        });

        if (!woreda) throw new AppError("errors.woreda_not_found", 404);

        // Check for ketenas
        const ketenaCount = await AdministrativeUnit.count({
            where: { parent_id: woreda.id },
        });

        if (ketenaCount > 0) {
            throw new AppError("errors.woreda_has_ketenas", 400);
        }

        // Because the `AdministrativeUnit` model has `paranoid: true`,
        // calling `.destroy()` implicitly performs a soft delete instead of hard delete.
        await woreda.destroy();

        return true;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("errors.internal_error", 500);
    }
};

// --- Ketena Services ---

const createKetenaService = async (name, woreda_id, user) => {
    try {
        // 1. Verify Woreda belongs to User's Health Center
        const parentWoreda = await AdministrativeUnit.findOne({
            where: { id: woreda_id, level: "WOREDA", parent_id: user.unit.id },
        });

        if (!parentWoreda) {
            throw new AppError("errors.woreda_not_found", 404); // Using woreda_not_found conceptually acts as scope bound violation
        }

        // 2. Check for duplicate ketena under the same woreda
        const existingKetena = await AdministrativeUnit.findOne({
            where: { name, level: "KETENA", parent_id: woreda_id },
        });

        if (existingKetena) {
            throw new AppError("errors.ketena_exists", 400);
        }

        // 3. Create Ketena
        const newKetena = await AdministrativeUnit.create({
            name,
            level: "KETENA",
            parent_id: woreda_id,
        });

        return newKetena;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("errors.internal_error", 500);
    }
};

const listKetenasService = async (woredaId, user) => {
    try {
        // 1. Verify Woreda ownership
        const parentWoreda = await AdministrativeUnit.findOne({
            where: { id: woredaId, level: "WOREDA", parent_id: user.unit.id },
        });

        if (!parentWoreda) {
            // Throw if they try to look at Ketenas for a Woreda outside their domain
            throw new AppError("errors.woreda_not_found", 404);
        }

        // 2. Fetch Ketenas
        const ketenas = await AdministrativeUnit.findAll({
            where: { level: "KETENA", parent_id: woredaId },
        });

        return ketenas;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("errors.fetch_ketenas_error", 500);
    }
};

const listAllKetenasInHealthCenterService = async (user) => {
    try {
        // Fetch all Woredas under the Health Center
        const woredas = await AdministrativeUnit.findAll({
            where: { level: "WOREDA", parent_id: user.unit.id },
            attributes: ["id"]
        });

        const woredaIds = woredas.map(w => w.id);

        if (woredaIds.length === 0) return [];

        // Fetch all Ketenas belonging to these Woredas
        const ketenas = await AdministrativeUnit.findAll({
            where: { level: "KETENA", parent_id: { [Op.in]: woredaIds } },
        });

        return ketenas;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("errors.fetch_ketenas_error", 500);
    }
};

const updateKetenaService = async (ketenaId, name, user) => {
    try {
        // First find Ketena to get its parent_id (woredaId)
        const ketena = await AdministrativeUnit.findOne({
            where: { id: ketenaId, level: "KETENA" },
        });

        if (!ketena) throw new AppError("errors.ketena_not_found", 404);

        // Verify Woreda belongs to User's Health Center
        const parentWoreda = await AdministrativeUnit.findOne({
            where: { id: ketena.parent_id, level: "WOREDA", parent_id: user.unit.id },
        });

        if (!parentWoreda) {
            throw new AppError("errors.ketena_not_found", 404); // Effectively hides/blocks the ketena if outside scope
        }

        // Check for duplicate name under the SAME Woreda
        const duplicate = await AdministrativeUnit.findOne({
            where: { name, level: "KETENA", parent_id: ketena.parent_id, id: { [Op.ne]: ketenaId } },
        });

        if (duplicate) throw new AppError("errors.ketena_exists", 400);

        ketena.name = name;
        await ketena.save();

        return ketena;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("errors.internal_error", 500);
    }
};

const deleteKetenaService = async (ketenaId, user) => {
    try {
        // Find Ketena
        const ketena = await AdministrativeUnit.findOne({
            where: { id: ketenaId, level: "KETENA" },
        });

        if (!ketena) throw new AppError("errors.ketena_not_found", 404);

        // Verify bounds (Woreda belongs to Health Center)
        const parentWoreda = await AdministrativeUnit.findOne({
            where: { id: ketena.parent_id, level: "WOREDA", parent_id: user.unit.id },
        });

        if (!parentWoreda) {
            throw new AppError("errors.ketena_not_found", 404);
        }

        // Check for blocks (future child of Ketena)
        const blockCount = await AdministrativeUnit.count({
            where: { parent_id: ketena.id },
        });

        if (blockCount > 0) {
            throw new AppError("errors.ketena_has_blocks", 400);
        }

        // Soft delete
        await ketena.destroy();

        return true;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("errors.internal_error", 500);
    }
};

// --- Block Services ---

const createBlockService = async (name, ketenaId, user) => {
    try {
        // 1. Verify Ketena exists
        const parentKetena = await AdministrativeUnit.findOne({
            where: { id: ketenaId, level: "KETENA" },
        });

        if (!parentKetena) {
            throw new AppError("errors.ketena_not_found", 404);
        }

        // 2. Verify Woreda belongs to User's Health Center
        const parentWoreda = await AdministrativeUnit.findOne({
            where: { id: parentKetena.parent_id, level: "WOREDA", parent_id: user.unit.id },
        });

        if (!parentWoreda) {
            throw new AppError("errors.ketena_not_found", 404); // Using ketena_not_found prevents leaking outside ownership structures
        }

        // 3. Check for duplicate block under the same ketena
        const existingBlock = await AdministrativeUnit.findOne({
            where: { name, level: "BLOCK", parent_id: ketenaId },
        });

        if (existingBlock) {
            throw new AppError("errors.block_exists", 400);
        }

        // 4. Create Block
        const newBlock = await AdministrativeUnit.create({
            name,
            level: "BLOCK",
            parent_id: ketenaId,
        });

        return newBlock;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("errors.internal_error", 500);
    }
};

const listBlocksService = async (ketenaId, user) => {
    try {
        // 1. Verify Ketena exists
        const parentKetena = await AdministrativeUnit.findOne({
            where: { id: ketenaId, level: "KETENA" },
        });

        if (!parentKetena) {
            throw new AppError("errors.ketena_not_found", 404);
        }

        // 2. Verify Woreda ownership
        const parentWoreda = await AdministrativeUnit.findOne({
            where: { id: parentKetena.parent_id, level: "WOREDA", parent_id: user.unit.id },
        });

        if (!parentWoreda) {
            throw new AppError("errors.ketena_not_found", 404);
        }

        // 3. Fetch Blocks
        const blocks = await AdministrativeUnit.findAll({
            where: { level: "BLOCK", parent_id: ketenaId },
        });

        return blocks;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("errors.fetch_blocks_error", 500);
    }
};

const listAllBlocksInHealthCenterService = async (user) => {
    try {
        // Fetch all Woredas
        const woredas = await AdministrativeUnit.findAll({
            where: { level: "WOREDA", parent_id: user.unit.id },
            attributes: ["id"]
        });
        const woredaIds = woredas.map(w => w.id);
        if (woredaIds.length === 0) return [];

        // Fetch all Ketenas
        const ketenas = await AdministrativeUnit.findAll({
            where: { level: "KETENA", parent_id: { [Op.in]: woredaIds } },
            attributes: ["id"]
        });
        const ketenaIds = ketenas.map(k => k.id);
        if (ketenaIds.length === 0) return [];

        // Fetch all Blocks
        const blocks = await AdministrativeUnit.findAll({
            where: { level: "BLOCK", parent_id: { [Op.in]: ketenaIds } },
        });

        return blocks;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("errors.fetch_blocks_error", 500);
    }
};

const updateBlockService = async (blockId, name, user) => {
    try {
        // First find Block
        const block = await AdministrativeUnit.findOne({
            where: { id: blockId, level: "BLOCK" },
        });

        if (!block) throw new AppError("errors.block_not_found", 404);

        // Find parent Ketena
        const parentKetena = await AdministrativeUnit.findOne({
            where: { id: block.parent_id, level: "KETENA" },
        });

        if (!parentKetena) throw new AppError("errors.ketena_not_found", 404);

        // Verify Woreda belongs to User's Health Center
        const parentWoreda = await AdministrativeUnit.findOne({
            where: { id: parentKetena.parent_id, level: "WOREDA", parent_id: user.unit.id },
        });

        if (!parentWoreda) {
            throw new AppError("errors.block_not_found", 404);
        }

        // Check for duplicate name under the SAME Ketena
        const duplicate = await AdministrativeUnit.findOne({
            where: { name, level: "BLOCK", parent_id: block.parent_id, id: { [Op.ne]: blockId } },
        });

        if (duplicate) throw new AppError("errors.block_exists", 400);

        block.name = name;
        await block.save();

        return block;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("errors.internal_error", 500);
    }
};

const deleteBlockService = async (blockId, user) => {
    try {
        // Find Block
        const block = await AdministrativeUnit.findOne({
            where: { id: blockId, level: "BLOCK" },
        });

        if (!block) throw new AppError("errors.block_not_found", 404);

        // Find parent Ketena
        const parentKetena = await AdministrativeUnit.findOne({
            where: { id: block.parent_id, level: "KETENA" },
        });

        if (!parentKetena) throw new AppError("errors.ketena_not_found", 404);

        // Verify Woreda bounds
        const parentWoreda = await AdministrativeUnit.findOne({
            where: { id: parentKetena.parent_id, level: "WOREDA", parent_id: user.unit.id },
        });

        if (!parentWoreda) {
            throw new AppError("errors.block_not_found", 404);
        }

        // Check for families (future child of Block)
        const familyCount = await AdministrativeUnit.count({
            where: { parent_id: block.id },
        });

        if (familyCount > 0) {
            throw new AppError("errors.block_has_families", 400);
        }

        // Soft delete
        await block.destroy();

        return true;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("errors.internal_error", 500);
    }
};

const listPcWorkersInBlockService = async (blockId, user) => {
    try {
        // 1. Verify Block exists
        const block = await AdministrativeUnit.findOne({
            where: { id: blockId, level: "BLOCK" },
        });

        if (!block) throw new AppError("errors.block_not_found", 404);

        // 2. Verify Ketena exists
        const parentKetena = await AdministrativeUnit.findOne({
            where: { id: block.parent_id, level: "KETENA" },
        });

        if (!parentKetena) throw new AppError("errors.ketena_not_found", 404);

        // 3. Verify Woreda ownership
        const parentWoreda = await AdministrativeUnit.findOne({
            where: { id: parentKetena.parent_id, level: "WOREDA", parent_id: user.unit.id },
        });

        if (!parentWoreda) {
            throw new AppError("errors.block_not_found", 404);
        }

        // 4. Fetch PC Workers
        const pcWorkers = await User.findAll({
            include: [
                {
                    model: UserAssignment,
                    where: { unit_id: blockId },
                    include: [
                        {
                            model: Role,
                            where: { name: "PC_WORKER" }
                        }
                    ]
                }
            ],
            attributes: { exclude: ['password'] }
        });

        return pcWorkers;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("errors.fetch_pc_workers_error", 500);
    }
};

module.exports = {
    listPcWorkersInBlockService,
    createWoredaService,
    listWoredasService,
    updateWoredaService,
    deleteWoredaService,
    createKetenaService,
    listKetenasService,
    listAllKetenasInHealthCenterService,
    updateKetenaService,
    deleteKetenaService,
    createBlockService,
    listBlocksService,
    listAllBlocksInHealthCenterService,
    updateBlockService,
    deleteBlockService,
};
