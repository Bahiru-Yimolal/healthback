/**
 * @swagger
 * tags:
 *   name: Woredas
 *   description: Woreda management endpoints (Under Health Centers)
 */

/**
 * @swagger
 * /community-units/woredas:
 *   post:
 *     summary: Create a new Woreda
 *     tags: [Woredas]
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
 *                 example: "Woreda 01"
 *     responses:
 *       201:
 *         description: Woreda created successfully
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
 *                   example: "Woreda created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     level:
 *                       type: string
 *                     parent_id:
 *                       type: string
 *       400:
 *         description: Bad request (e.g., missing name or duplicate woreda)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions or wrong level)
 */

/**
 * @swagger
 * /community-units/woredas:
 *   get:
 *     summary: List all Woredas under the user's Health Center
 *     tags: [Woredas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of woredas
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
 *                       name:
 *                         type: string
 *                       level:
 *                         type: string
 *                       parent_id:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /community-units/woredas/{id}:
 *   put:
 *     summary: Update a Woreda
 *     tags: [Woredas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Woreda ID
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
 *                 example: "Updated Woreda 01"
 *     responses:
 *       200:
 *         description: Woreda updated successfully
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
 *                   example: "Woreda updated successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Woreda not found
 */

/**
 * @swagger
 * /community-units/woredas/{id}:
 *   delete:
 *     summary: Soft delete a Woreda
 *     tags: [Woredas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Woreda ID
 *     responses:
 *       200:
 *         description: Woreda deleted successfully
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
 *                   example: "Woreda deleted successfully"
 *       400:
 *         description: Cannot delete Woreda with existing Ketenas
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Woreda not found
 */

/**
 * @swagger
 * tags:
 *   name: Ketenas
 *   description: Ketena management endpoints (Under Woredas)
 */

/**
 * @swagger
 * /community-units/ketenas:
 *   post:
 *     summary: Create a new Ketena
 *     tags: [Ketenas]
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
 *               - woreda_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ketena 01"
 *               woreda_id:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       201:
 *         description: Ketena created successfully
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
 *                   example: "Ketena created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     level:
 *                       type: string
 *                     parent_id:
 *                       type: string
 *       400:
 *         description: Bad request (e.g., missing name or woreda_id)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Woreda not found or not in your jurisdiction
 */

/**
 * @swagger
 * /community-units/ketenas:
 *   get:
 *     summary: List all Ketenas under the user's Health Center
 *     tags: [Ketenas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: woredaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Ketena ID
 *     responses:
 *       200:
 *         description: A list of ketenas
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
 *                       name:
 *                         type: string
 *                       level:
 *                         type: string
 *                       parent_id:
 *                         type: string
 *                       parent_woreda_name:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /community-units/ketenas/all:
 *   get:
 *     summary: List all Ketenas under the user's entire Health Center
 *     tags: [Ketenas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all ketenas in the health center
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
 *                       name:
 *                         type: string
 *                       level:
 *                         type: string
 *                       parent_id:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /community-units/ketenas/{id}:
 *   put:
 *     summary: Update a Ketena
 *     tags: [Ketenas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Ketena ID
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
 *                 example: "Updated Ketena 01"
 *     responses:
 *       200:
 *         description: Ketena updated successfully
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
 *                   example: "Ketena updated successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ketena not found
 */

/**
 * @swagger
 * /community-units/ketenas/{id}:
 *   delete:
 *     summary: Soft delete a Ketena
 *     tags: [Ketenas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Ketena ID
 *     responses:
 *       200:
 *         description: Ketena deleted successfully
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
 *                   example: "Ketena deleted successfully"
 *       400:
 *         description: Cannot delete Ketena with existing Blocks
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ketena not found
 */

/**
 * @swagger
 * tags:
 *   name: Blocks
 *   description: Block management endpoints (Under Ketenas)
 */

/**
 * @swagger
 * /community-units/blocks:
 *   post:
 *     summary: Create a new Block
 *     tags: [Blocks]
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
 *               - ketenaId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Block 01"
 *               ketenaId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       201:
 *         description: Block created successfully
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
 *                   example: "Block created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     level:
 *                       type: string
 *                     parent_id:
 *                       type: string
 *       400:
 *         description: Bad request (e.g., missing name or ketenaId)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Ketena not found or not in your jurisdiction
 */

/**
 * @swagger
 * /community-units/blocks:
 *   get:
 *     summary: List all Blocks under a specific Ketena (verifying ownership)
 *     tags: [Blocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ketenaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Ketena ID
 *     responses:
 *       200:
 *         description: A list of Blocks
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
 *                       name:
 *                         type: string
 *                       level:
 *                         type: string
 *                       parent_id:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ketena not found
 */

/**
 * @swagger
 * /community-units/blocks/all:
 *   get:
 *     summary: List all Blocks under the user's entire Health Center
 *     tags: [Blocks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all blocks in the health center
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
 *                       name:
 *                         type: string
 *                       level:
 *                         type: string
 *                       parent_id:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /community-units/blocks/{id}/pc-workers:
 *   get:
 *     summary: List all PC Workers assigned to a specific Block
 *     tags: [Blocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Block ID
 *     responses:
 *       200:
 *         description: A list of PC Workers
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Block not found
 */

/**
 * @swagger
 * /community-units/blocks/{id}:
 *   put:
 *     summary: Update a Block
 *     tags: [Blocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Block ID
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
 *                 example: "Updated Block 01"
 *     responses:
 *       200:
 *         description: Block updated successfully
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
 *                   example: "Block updated successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Block not found
 */

/**
 * @swagger
 * /community-units/blocks/{id}:
 *   delete:
 *     summary: Soft delete a Block
 *     tags: [Blocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Block ID
 *     responses:
 *       200:
 *         description: Block deleted successfully
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
 *                   example: "Block deleted successfully"
 *       400:
 *         description: Cannot delete Block with existing Families
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Block not found
 */
