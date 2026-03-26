const {
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
    listPcWorkersInBlockService,
} = require("../services/communityUnitService");

const createWoredaController = async (req, res, next) => {
    try {
        const { name } = req.body;

        const newWoreda = await createWoredaService(name, req.user);

        res.status(201).json({
            success: true,
            message: req.t("success.woreda_created"),
            data: newWoreda,
        });
    } catch (error) {
        next(error);
    }
};

const listWoredasController = async (req, res, next) => {
    try {
        const woredas = await listWoredasService(req.user);

        res.status(200).json({
            success: true,
            data: woredas,
        });
    } catch (error) {
        next(error);
    }
};

const updateWoredaController = async (req, res, next) => {
    try {
        const { name } = req.body;
        const { id } = req.params;

        const updatedWoreda = await updateWoredaService(id, name, req.user);

        res.status(200).json({
            success: true,
            message: req.t("success.woreda_updated"),
            data: updatedWoreda,
        });
    } catch (error) {
        next(error);
    }
};

const deleteWoredaController = async (req, res, next) => {
    try {
        const { id } = req.params;

        await deleteWoredaService(id, req.user);

        res.status(200).json({
            success: true,
            message: req.t("success.woreda_deleted"),
        });
    } catch (error) {
        next(error);
    }
};

// --- Ketena Controllers ---

const createKetenaController = async (req, res, next) => {
    try {
        const { name, woreda_id } = req.body;

        const newKetena = await createKetenaService(name, woreda_id, req.user);

        res.status(201).json({
            success: true,
            message: req.t("success.ketena_created"),
            data: newKetena,
        });
    } catch (error) {
        next(error);
    }
};

const listKetenasController = async (req, res, next) => {
    try {
        const { woredaId } = req.query;

        if (!woredaId) {
            return res.status(400).json({
                success: false,
                message: req.t("errors.woreda_id_required"),
            });
        }

        const ketenas = await listKetenasService(woredaId, req.user);

        res.status(200).json({
            success: true,
            data: ketenas,
        });
    } catch (error) {
        next(error);
    }
};

const listAllKetenasInHealthCenterController = async (req, res, next) => {
    try {
        const ketenas = await listAllKetenasInHealthCenterService(req.user);

        res.status(200).json({
            success: true,
            data: ketenas,
        });
    } catch (error) {
        next(error);
    }
};

const updateKetenaController = async (req, res, next) => {
    try {
        const { name } = req.body;
        const { id } = req.params;

        const updatedKetena = await updateKetenaService(id, name, req.user);

        res.status(200).json({
            success: true,
            message: req.t("success.ketena_updated"),
            data: updatedKetena,
        });
    } catch (error) {
        next(error);
    }
};

const deleteKetenaController = async (req, res, next) => {
    try {
        const { id } = req.params;

        await deleteKetenaService(id, req.user);

        res.status(200).json({
            success: true,
            message: req.t("success.ketena_deleted"),
        });
    } catch (error) {
        next(error);
    }
};
// --- Block Controllers ---

const createBlockController = async (req, res, next) => {
    try {
        const { name, ketenaId } = req.body;

        const newBlock = await createBlockService(name, ketenaId, req.user);

        res.status(201).json({
            success: true,
            message: req.t("success.block_created"),
            data: newBlock,
        });
    } catch (error) {
        next(error);
    }
};

const listBlocksController = async (req, res, next) => {
    try {
        const { ketenaId } = req.query;

        if (!ketenaId) {
            return res.status(400).json({
                success: false,
                message: req.t("errors.ketena_id_required"),
            });
        }

        const blocks = await listBlocksService(ketenaId, req.user);

        res.status(200).json({
            success: true,
            data: blocks,
        });
    } catch (error) {
        next(error);
    }
};

const listAllBlocksInHealthCenterController = async (req, res, next) => {
    try {
        const blocks = await listAllBlocksInHealthCenterService(req.user);

        res.status(200).json({
            success: true,
            data: blocks,
        });
    } catch (error) {
        next(error);
    }
};

const updateBlockController = async (req, res, next) => {
    try {
        const { name } = req.body;
        const { id } = req.params;

        const updatedBlock = await updateBlockService(id, name, req.user);

        res.status(200).json({
            success: true,
            message: req.t("success.block_updated"),
            data: updatedBlock,
        });
    } catch (error) {
        next(error);
    }
};

const deleteBlockController = async (req, res, next) => {
    try {
        const { id } = req.params;

        await deleteBlockService(id, req.user);

        res.status(200).json({
            success: true,
            message: req.t("success.block_deleted"),
        });
    } catch (error) {
        next(error);
    }
};

const listPcWorkersInBlockController = async (req, res, next) => {
    try {
        const { id } = req.params;

        const pcWorkers = await listPcWorkersInBlockService(id, req.user);

        res.status(200).json({
            success: true,
            data: pcWorkers,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listPcWorkersInBlockController,
    createWoredaController,
    listWoredasController,
    updateWoredaController,
    deleteWoredaController,
    createKetenaController,
    listKetenasController,
    listAllKetenasInHealthCenterController,
    updateKetenaController,
    deleteKetenaController,
    createBlockController,
    listBlocksController,
    listAllBlocksInHealthCenterController,
    updateBlockController,
    deleteBlockController,
};
