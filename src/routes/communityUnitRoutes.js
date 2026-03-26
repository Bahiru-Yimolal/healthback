const express = require("express");
const {
    protect,
    assignmentMiddleware,
    levelGuard,
    permissionMiddleware,
} = require("../middlewares/authMiddleware");

const {
    validateWoredaInput,
    validateKetenaCreationInput,
    validateKetenaUpdateInput,
    validateBlockCreationInput,
    validateBlockUpdateInput,
} = require("../validators/communityUnitValidators");

const {
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
    listPcWorkersInBlockController,
} = require("../controllers/communityUnitControllers");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Woredas
 *   description: Woreda management endpoints (Under Health Centers)
 */

// Create Woreda
router.post(
    "/woredas",
    protect,
    assignmentMiddleware,
    levelGuard(["HEALTH_CENTER"]), // Only Health Center Admins can create Woredas
    permissionMiddleware("MANAGE_COMMUNITY_UNITS"),
    validateWoredaInput,
    createWoredaController
);

// List Woredas
router.get(
    "/woredas",
    protect,
    assignmentMiddleware,
    listWoredasController
);

// Update Woreda
router.put(
    "/woredas/:id",
    protect,
    assignmentMiddleware,
    levelGuard(["HEALTH_CENTER"]),
    permissionMiddleware("MANAGE_COMMUNITY_UNITS"),
    validateWoredaInput,
    updateWoredaController
);

// Delete Woreda (Soft Delete)
router.delete(
    "/woredas/:id",
    protect,
    assignmentMiddleware,
    levelGuard(["HEALTH_CENTER"]),
    permissionMiddleware("MANAGE_COMMUNITY_UNITS"),
    deleteWoredaController
);

// --- Ketena Routes ---

// Create Ketena
router.post(
    "/ketenas",
    protect,
    assignmentMiddleware,
    levelGuard(["HEALTH_CENTER"]),
    permissionMiddleware("MANAGE_COMMUNITY_UNITS"),
    validateKetenaCreationInput,
    createKetenaController
);

// List Ketenas
router.get(
    "/ketenas",
    protect,
    assignmentMiddleware,
    listKetenasController
);

// List All Ketenas in Health Center
router.get(
    "/ketenas/all",
    protect,
    assignmentMiddleware,
    listAllKetenasInHealthCenterController
);

// Update Ketena
router.put(
    "/ketenas/:id",
    protect,
    assignmentMiddleware,
    levelGuard(["HEALTH_CENTER"]),
    permissionMiddleware("MANAGE_COMMUNITY_UNITS"),
    validateKetenaUpdateInput,
    updateKetenaController
);

// Delete Ketena (Soft Delete)
router.delete(
    "/ketenas/:id",
    protect,
    assignmentMiddleware,
    levelGuard(["HEALTH_CENTER"]),
    permissionMiddleware("MANAGE_COMMUNITY_UNITS"),
    deleteKetenaController
);

// --- Block Routes ---

// Create Block
router.post(
    "/blocks",
    protect,
    assignmentMiddleware,
    levelGuard(["HEALTH_CENTER"]),
    permissionMiddleware("MANAGE_COMMUNITY_UNITS"),
    validateBlockCreationInput,
    createBlockController
);

// List Blocks
router.get(
    "/blocks",
    protect,
    assignmentMiddleware,
    listBlocksController
);

// List All Blocks in Health Center
router.get(
    "/blocks/all",
    protect,
    assignmentMiddleware,
    listAllBlocksInHealthCenterController
);

// List PC Workers in a Block
router.get(
    "/blocks/:id/pc-workers",
    protect,
    assignmentMiddleware,
    listPcWorkersInBlockController
);

// Update Block
router.put(
    "/blocks/:id",
    protect,
    assignmentMiddleware,
    levelGuard(["HEALTH_CENTER"]),
    permissionMiddleware("MANAGE_COMMUNITY_UNITS"),
    validateBlockUpdateInput,
    updateBlockController
);

// Delete Block (Soft Delete)
router.delete(
    "/blocks/:id",
    protect,
    assignmentMiddleware,
    levelGuard(["HEALTH_CENTER"]),
    permissionMiddleware("MANAGE_COMMUNITY_UNITS"),
    deleteBlockController
);

module.exports = router;
