/**
 * @swagger
 * /subcities:
 *   post:
 *     summary: Create a new Subcity (City Admin only)
 *     tags: [City Admin]
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
 *                 example: "Bole"
 *                 description: Name of the subcity to create
 *     responses:
 *       201:
 *         description: Subcity created successfully
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
 *                   example: "Subcity created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     name:
 *                       type: string
 *                       example: "Bole"
 *                     level:
 *                       type: string
 *                       example: "SUBCITY"
 *                     parent_id:
 *                       type: string
 *                       format: uuid
 *                       example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *       400:
 *         description: Invalid input or subcity already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Subcity name is required"
 *       401:
 *         description: Unauthorized – token missing or invalid
 *       403:
 *         description: Forbidden – user not City Admin or lacks permissions
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /subcities:
 *   get:
 *     summary: List all subcities for the current City (City Admin only)
 *     tags: [City Admin]
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subcities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 subcities:
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
 *                         example: "Bole"
 *                       level:
 *                         type: string
 *                         example: "SUBCITY"
 *                       parent_id:
 *                         type: string
 *                         format: uuid
 *                         example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
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
 *                                   example: "Abebe"
 *                                 last_name:
 *                                   type: string
 *                                   example: "Kebede"
 *       401:
 *         description: Unauthorized – token missing or invalid
 *       403:
 *         description: Forbidden – user not City Admin or lacks permissions
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /subcities/{id}:
 *   put:
 *     summary: Update subcity information (City Admin only)
 *     tags: [City Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - name: id
 *         in: path
 *         description: ID of the subcity to update
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
 *                 example: "New Bole"
 *                 description: New name of the subcity
 *     responses:
 *       200:
 *         description: Subcity updated successfully
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
 *                   example: "Subcity updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                       example: "New Bole"
 *                     level:
 *                       type: string
 *                       example: "SUBCITY"
 *       400:
 *         description: Invalid input or duplicate name
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subcity not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /subcities/{id}:
 *   delete:
 *     summary: Delete a subcity (only if no children exist, City Admin only)
 *     tags: [City Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - name: id
 *         in: path
 *         description: ID of the subcity to delete
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subcity deleted successfully
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
 *                   example: "Subcity deleted successfully"
 *       400:
 *         description: Cannot delete subcity with existing children (e.g. Woredas)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subcity not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /subcities/assign/subcity-admin:
 *   post:
 *     summary: Assign a Subcity Admin to a Subcity (City Admin only)
 *     tags: [City Admin]
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
 *               - subcityId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *                 description: ID of the user to be assigned as Subcity Admin
 *               subcityId:
 *                 type: string
 *                 format: uuid
 *                 example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *                 description: ID of the subcity administrative unit
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - CREATE_CRIME_FOLDER
 *                   - READ_CRIME_FOLDER
 *                 description: Optional custom permissions (defaults to SUBCITY_ADMIN role permissions if omitted)
 *     responses:
 *       201:
 *         description: Subcity Admin assigned successfully
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
 *                   example: "Subcity Admin assigned successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                     unit_id:
 *                       type: string
 *                       format: uuid
 *                     role_id:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: Invalid input or assignment conflict
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – not City Admin or attempting to assign outside own city
 *       404:
 *         description: User, subcity, or role not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /subcities/assign/users:
 *   post:
 *     summary: Create/Assign a User to the Subcity (City Admin only)
 *     tags: [City Admin]
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
 *                 description: Role name to assign (e.g., SUBCITY_OFFICER)
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
 *     summary: Update a Subcity User's Role/Permissions (City Admin only)
 *     tags: [City Admin]
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
 *         description: User not found or not in subcity
 */
