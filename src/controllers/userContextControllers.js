const { getUserContextService, getUserHierarchyService } = require("../services/userContextService");

/**
 * GET /users/me/context
 * Returns the requesting user's position in the administrative hierarchy.
 */
const getUserContextController = async (req, res, next) => {
  try {
    const context = await getUserContextService(req.user);

    res.status(200).json({
      status: "success",
      user_context: context,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /users/me/hierarchy
 * Returns the full nested administrative hierarchy accessible to this user.
 */
const getUserHierarchyController = async (req, res, next) => {
  try {
    const hierarchy = await getUserHierarchyService(req.user);

    res.status(200).json({
      status: "success",
      data: hierarchy,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserContextController,
  getUserHierarchyController,
};
