/**
 * @swagger
 * /cities:
 *   post:
 *     summary: Create a new City (Ethiopia-level only)
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Addis Ababa"
 *                 description: Name of the city to create
 *     responses:
 *       201:
 *         description: City created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 city:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     name:
 *                       type: string
 *                       example: "Addis Ababa"
 *                     level:
 *                       type: string
 *                       example: "CITY"
 *                     parent_id:
 *                       type: string
 *                       format: uuid
 *                       example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *                 message:
 *                   type: string
 *                   example: "City created successfully"
 *       400:
 *         description: Invalid input or city already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "City with this name already exists"
 *       401:
 *         description: Unauthorized – token missing or invalid
 *       403:
 *         description: Forbidden – user not Ethiopia-level or lacks CREATE_CITY permission
 */

/**
 * @swagger
 * /cities:
 *   get:
 *     summary: List all cities (Ethiopia-level only)
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     responses:
 *       200:
 *         description: List of cities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 cities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       name:
 *                         type: string
 *                         example: "Addis Ababa"
 *                       level:
 *                         type: string
 *                         example: "CITY"
 *                       parent_id:
 *                         type: string
 *                         format: uuid
 *                         example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *       401:
 *         description: Unauthorized – token missing or invalid
 *       403:
 *         description: Forbidden – user not Ethiopia-level or lacks READ permission
 */

/**
 * @swagger
 * /cities/{id}:
 *   put:
 *     summary: Update city information (Ethiopia-level only)
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - name: id
 *         in: path
 *         description: ID of the city to update
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Addis Ababa"
 *                 description: New name of the city
 *     responses:
 *       200:
 *         description: City updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 city:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     name:
 *                       type: string
 *                       example: "New Addis Ababa"
 *                     level:
 *                       type: string
 *                       example: "CITY"
 *                     parent_id:
 *                       type: string
 *                       format: uuid
 *                       example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *                 message:
 *                   type: string
 *                   example: "City updated successfully"
 *       400:
 *         description: Invalid input or duplicate city name
 *       401:
 *         description: Unauthorized – token missing or invalid
 *       403:
 *         description: Forbidden – user not Ethiopia-level or lacks UPDATE permission
 *       404:
 *         description: City not found
 */


/**
 * @swagger
 * /cities/{id}:
 *   delete:
 *     summary: Delete a city (only if no sub-cities exist, Ethiopia-level only)
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - name: id
 *         in: path
 *         description: ID of the city to delete
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: City deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "City deleted successfully"
 *       400:
 *         description: Cannot delete city with sub-cities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cannot delete city with sub-cities. Delete sub-cities first."
 *       401:
 *         description: Unauthorized – token missing or invalid
 *       403:
 *         description: Forbidden – user not Ethiopia-level or lacks DELETE permission
 *       404:
 *         description: City not found
 */

/**
 * @swagger
 * /cities/assign/city-admin:
 *   post:
 *     summary: Assign a City Admin to a City (Ethiopia-level only)
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - cityId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *                 description: ID of the user to be assigned as City Admin
 *               cityId:
 *                 type: string
 *                 format: uuid
 *                 example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *                 description: ID of the city administrative unit
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - CREATE_FOLDER
 *                   - READ_FOLDER
 *                   - UPDATE_FOLDER
 *                   - DELETE_FOLDER
 *                   - ADMIN_PERMISSIONS
 *                 description: Optional custom permissions (defaults to ADMIN role permissions if omitted)
 *     responses:
 *       201:
 *         description: City Admin assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "City Admin assigned successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     assignment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *                         user_id:
 *                           type: string
 *                           format: uuid
 *                         unit_id:
 *                           type: string
 *                           format: uuid
 *                         role_id:
 *                           type: string
 *                           format: uuid
 *                     role:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                           example: "ADMIN"
 *                     unit:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         level:
 *                           type: string
 *                           example: "CITY"
 *       400:
 *         description: Invalid input or assignment conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User already assigned. Unassign before reassigning."
 *       401:
 *         description: Unauthorized – token missing or invalid
 *       403:
 *         description: Forbidden – not Ethiopia-level or missing permission
 *       404:
 *         description: User, city, or role not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /cities/assign/users:
 *   post:
 *     summary: Assign a user to Ethiopia level (Admin / Officer / Analyst)
 *     description: >
 *       Assigns an already registered UNASSIGNED user to the Ethiopia administrative level
 *       with a specified role and optional custom permissions.
 *       Only Ethiopia-level Super Admins with MANAGE_USERS permission can perform this action.
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - role
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 example: "ad1f3384-60f4-4c10-827a-52306633302f"
 *                 description: ID of the user to assign (must be UNASSIGNED)
 *               role:
 *                 type: string
 *                 enum: [ADMIN, OFFICER, ANALYST]
 *                 example: "ADMIN"
 *                 description: Role to assign at Ethiopia level
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - CREATE_CRIME_FOLDER
 *                   - READ_CRIME_FOLDER
 *                   - UPDATE_CRIME_FOLDER
 *                 description: >
 *                   Optional list of permission names.
 *                   If omitted, default permissions for the role will be applied.
 *     responses:
 *       200:
 *         description: User assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User assigned to Ethiopia level successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: "ad1f3384-60f4-4c10-827a-52306633302f"
 *                         phone_number:
 *                           type: string
 *                           example: "+251911234567"
 *                         status:
 *                           type: string
 *                           example: "ACTIVE"
 *                     assignment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: "e3c9d3b7-11fa-4fd6-b3db-b2c3a9f01234"
 *                     role:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: "8a9b7c66-1a2b-4d2f-9a33-cc55eeaa7788"
 *                         name:
 *                           type: string
 *                           example: "ADMIN"
 *                     unit:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *                         level:
 *                           type: string
 *                           example: "ETHIOPIA"
 *       400:
 *         description: Invalid input or role
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       403:
 *         description: Forbidden – insufficient permission or wrong level
 *       404:
 *         description: User not found
 *       409:
 *         description: User already assigned
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /cities/assign/users:
 *   put:
 *     summary: Update Ethiopia-level user role and permissions
 *     description: >
 *       Updates the role and permissions of a user already assigned to the Ethiopia
 *       administrative level.
 *       This endpoint allows changing the user's role (Admin / Officer / Analyst)
 *       and optionally overriding their permissions.
 *       If permissions are not provided, default permissions for the role are applied.
 *       Only Ethiopia-level Super Admins with ADMIN_PERMISSIONS can perform this action.
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - role
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 example: "ad1f3384-60f4-4c10-827a-52306633302f"
 *                 description: ID of the user already assigned to Ethiopia level
 *               role:
 *                 type: string
 *                 enum: [ADMIN, OFFICER, ANALYST]
 *                 example: "OFFICER"
 *                 description: New role to assign at Ethiopia level
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - CREATE_CRIME_FOLDER
 *                   - READ_CRIME_FOLDER
 *                 description: >
 *                   Optional list of permission names.
 *                   If omitted, default permissions for the selected role will be applied.
 *     responses:
 *       200:
 *         description: User role and permissions updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User role and permissions updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                       example: "ad1f3384-60f4-4c10-827a-52306633302f"
 *                     unit:
 *                       type: string
 *                       example: "ETHIOPIA"
 *                     role:
 *                       type: string
 *                       example: "OFFICER"
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - CREATE_CRIME_FOLDER
 *                         - READ_CRIME_FOLDER
 *       400:
 *         description: Invalid input or role
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       403:
 *         description: Forbidden – insufficient permission or wrong level
 *       404:
 *         description: User not assigned to Ethiopia level
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /cities/users/unassign:
 *   delete:
 *     summary: Unassign a user from their current unit
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *                 description: UUID of the user to unassign
 *     responses:
 *       200:
 *         description: User unassigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User unassigned successfully"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User ID is required"
 *       401:
 *         description: Unauthorized – token missing or invalid
 *       403:
 *         description: Forbidden – user not allowed to unassign
 *       404:
 *         description: User not assigned or not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User is not assigned"
 */

/**
 * @swagger
 * /cities/users/permissions:
 *   put:
 *     summary: Update a user's permissions
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *                 description: UUID of the user to update
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["CREATE_CRIME_FOLDER", "READ_CRIME_FOLDER"]
 *                 description: Optional array of permission names to assign
 *     responses:
 *       200:
 *         description: Permissions updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User permissions updated successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     role:
 *                       type: string
 *                       example: "ADMIN"
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["CREATE_CRIME_FOLDER", "READ_CRIME_FOLDER"]
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized – token missing or invalid
 *       403:
 *         description: Forbidden – user lacks MANAGE_USERS permission
 *       404:
 *         description: User not assigned
 */

/**
 * @swagger
 * /cities/permissions:
 *   get:
 *     summary: Get all system permissions
 *     description: >
 *       Retrieves the complete list of permissions available in the system.
 *       Used by admins when assigning or updating user permissions.
 *       Only users with ADMIN_PERMISSIONS can access this endpoint.
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     responses:
 *       200:
 *         description: List of permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "8a9b7c66-1a2b-4d2f-9a33-cc55eeaa7788"
 *                       name:
 *                         type: string
 *                         example: "CREATE_CRIME_FOLDER"
 *                       description:
 *                         type: string
 *                         example: "Allows creating a crime folder"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       403:
 *         description: Forbidden – user lacks ADMIN_PERMISSIONS
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /cities/roles:
 *   get:
 *     summary: Get all system roles
 *     description: >
 *       Retrieves all roles available in the system.
 *       Used when assigning or updating users at different administrative levels.
 *       Only users with ADMIN_PERMISSIONS can access this endpoint.
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "8a9b7c66-1a2b-4d2f-9a33-cc55eeaa7788"
 *                       name:
 *                         type: string
 *                         example: "ADMIN"
 *                       description:
 *                         type: string
 *                         example: "Administrator role with full privileges"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       403:
 *         description: Forbidden – user lacks ADMIN_PERMISSIONS
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /cities/personnel:
 *   get:
 *     summary: Fetch personnel by role within the Admin's unit (derived from token)
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Role name to filter by (defaults to GROUP_LEADER if omitted)
 *     responses:
 *       200:
 *         description: List of personnel retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         format: uuid
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone_number:
 *                         type: string
 *                       status:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /cities/personnel/unit-details:
 *   get:
 *     summary: Get all personnel in the same unit with roles and permissions (Admin only)
 *     description: Retrieves all users assigned to the same administrative unit as the requesting admin, including their roles and assigned permissions.
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of unit personnel with details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone_number:
 *                         type: string
 *                       status:
 *                         type: string
 *                       role:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             description:
 *                               type: string
 *       401:
 *         description: Illegal or expired token
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       500:
 *         description: Database error
 */
