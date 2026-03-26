/**
 * @swagger
 * /health-centers:
 *   post:
 *     summary: Create a new HealthCenter (Subcity Admin only)
 *     tags: [Subcity Admin]
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Education HealthCenter"
 *                 description: Name of the healthCenter to create
 *     responses:
 *       201:
 *         description: HealthCenter created successfully
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
 *                   example: "HealthCenter created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     name:
 *                       type: string
 *                       example: "Education HealthCenter"
 *                     level:
 *                       type: string
 *                       example: "HEALTH_CENTER"
 *                     parent_id:
 *                       type: string
 *                       format: uuid
 *                       example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *       400:
 *         description: Invalid input or healthCenter already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /health-centers:
 *   get:
 *     summary: List all healthCenters for the current Subcity (Subcity Admin only)
 *     tags: [Subcity Admin]
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of healthCenters
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
 *                       name:
 *                         type: string
 *                         example: "Education HealthCenter"
 *                       level:
 *                         type: string
 *                         example: "HEALTH_CENTER"
 *                       parent_id:
 *                         type: string
 *                         format: uuid
 *                       UserAssignments:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                             User:
 *                               type: object
 *                               properties:
 *                                 first_name:
 *                                   type: string
 *                                 last_name:
 *                                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /health-centers/{id}:
 *   put:
 *     summary: Update healthCenter information (Subcity Admin only)
 *     tags: [Subcity Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - name: id
 *         in: path
 *         description: ID of the healthCenter to update
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
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Health HealthCenter"
 *     responses:
 *       200:
 *         description: HealthCenter updated successfully
 *       400:
 *         description: Invalid input or duplicate name
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: HealthCenter not found
 */

/**
 * @swagger
 * /health-centers/{id}:
 *   delete:
 *     summary: Delete a healthCenter (Subcity Admin only)
 *     tags: [Subcity Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - name: id
 *         in: path
 *         description: ID of the healthCenter to delete
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: HealthCenter deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: HealthCenter not found
 */

/**
 * @swagger
 * /health-centers/assign/healthCenter-admin:
 *   post:
 *     summary: Assign a HealthCenter Admin to a HealthCenter (Subcity Admin only)
 *     tags: [Subcity Admin]
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - healthCenterId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user to be assigned
 *               healthCenterId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the healthCenter
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: HealthCenter Admin assigned successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User or healthCenter not found
 */

/**
 * @swagger
 * /health-centers/assign/users:
 *   post:
 *     summary: Create/Assign a User to the HealthCenter (Subcity Admin only)
 *     tags: [Subcity Admin]
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     security:
 *       - bearerAuth: []
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
 *                 description: ID of the user to assign
 *               role:
 *                 type: string
 *                 description: Role name to assign (e.g., HEALTH_CENTER_OFFICER)
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional specific permissions
 *     responses:
 *       201:
 *         description: User assigned successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden
 *   put:
 *     summary: Update a HealthCenter User's Role/Permissions (Subcity Admin only)
 *     tags: [Subcity Admin]
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               role:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found or not in healthCenter
 */

/**
 * @swagger
 * /health-centers/assign/own-users:
 *   post:
 *     summary: Create/Assign a User to the HealthCenter (HealthCenter Admin only - Self Management)
 *     tags: [HealthCenter Admin]
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     security:
 *       - bearerAuth: []
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
 *                 description: ID of the user to assign
 *               role:
 *                 type: string
 *                 description: Role name to assign (e.g., HEALTH_CENTER_OFFICER)
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional specific permissions
 *     responses:
 *       201:
 *         description: User assigned successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden
 *   put:
 *     summary: Update a HealthCenter User's Role/Permissions (HealthCenter Admin only - Self Management)
 *     tags: [HealthCenter Admin]
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               role:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found or not in healthCenter
 */

/**
 * @swagger
 * /health-centers/assign/pc-worker:
 *   post:
 *     summary: Assign a PC Worker to multiple Blocks (HealthCenter Admin only)
 *     tags: [HealthCenter Admin]
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - unitIds
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user to assign as PC Worker
 *               unitIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of Block IDs (Administrative Unit level must be BLOCK)
 *               role:
 *                 type: string
 *                 default: "PC_WORKER"
 *                 description: Role to assign (default is PC_WORKER)
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional specific permissions
 *     responses:
 *       201:
 *         description: PC Worker assigned successfully to all blocks
 *       400:
 *         description: Invalid input or invalid unit level (must be BLOCK)
 *       403:
 *         description: Forbidden (Jurisdiction violation or mission level)
 *       404:
 *         description: User or unit not found
 *   patch:
 *     summary: Update a PC Worker's Block Assignments (HealthCenter Admin only)
 *     description: Replaces old block assignments with a new set of blocks. Old assignments within the Health Center's jurisdiction are removed before adding the new ones.
 *     tags: [HealthCenter Admin]
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - unitIds
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user whose assignments represent the new state
 *               unitIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: New array of Block IDs (Administrative Unit level must be BLOCK)
 *               role:
 *                 type: string
 *                 default: "PC_WORKER"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: PC Worker assignments updated successfully
 *       400:
 *         description: Invalid input or invalid unit level
 *       403:
 *         description: Forbidden (Jurisdiction violation)
 *       404:
 *         description: User or unit not found
 */
/**
* @swagger
* /health-centers/{id}/pc-workers:
*   get:
*     summary: List all PC Workers assigned to sub-blocks of a specific Health Center
*     tags: [HealthCenter Admin, Subcity Admin]
*     security:
*       - bearerAuth: []
*     parameters:
*       - $ref: '#/components/parameters/acceptLanguageHeader'
*       - name: id
*         in: path
*         description: ID of the Health Center
*         required: true
*         schema:
*           type: string
*           format: uuid
*     responses:
*       200:
*         description: List of PC Workers retrieved successfully
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
*                       phone_number:
*                         type: string
*                       email:
*                         type: string
*                       status:
*                         type: string
*       401:
*         description: Unauthorized
*       403:
*         description: Forbidden (Jurisdiction violation)
*       404:
*         description: Health Center not found
*/
