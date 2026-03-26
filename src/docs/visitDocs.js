/**
 * @swagger
 * tags:
 *   name: Visits
 *   description: Household visit management and tracking
 */

/**
 * @swagger
 * /visits:
 *   post:
 *     summary: Start a new household visit
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - family_id
 *             properties:
 *               family_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the family being visited
 *               latitude:
 *                 type: number
 *                 description: Current latitude of the PC worker
 *               longitude:
 *                 type: number
 *                 description: Current longitude of the PC worker
 *     responses:
 *       201:
 *         description: Visit started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     visit_id:
 *                       type: string
 *                       format: uuid
 *                     visit_number:
 *                       type: integer
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Family not found
 *       500:
 *         description: Server error
 *
 * /visits/{id}:
 *   get:
 *     summary: Fetch details of a household visit including assessments
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the visit to fetch
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Visit details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     family_id:
 *                       type: string
 *                       format: uuid
 *                     visitor_id:
 *                       type: string
 *                       format: uuid
 *                     visit_number:
 *                       type: integer
 *                     visit_date:
 *                       type: string
 *                       format: date-time
 *                     PregnantAssessment:
 *                       type: object
 *                       nullable: true
 *                     PostnatalAssessment:
 *                       type: object
 *                       nullable: true
 *                     ChildAssessment:
 *                       type: object
 *                       nullable: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Visit not found
 *       500:
 *         description: Server error
 *
 *   patch:
 *     summary: Update an existing household visit
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the visit to update
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
 *               next_appointment_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-03-25"
 *               service_type:
 *                 type: string
 *                 enum: ["ASSESSMENT", "GENERAL_COUNSELING", "OFFICIAL_SUPPORT_CHECK", "OTHER"]
 *               is_eligible_for_support:
 *                 type: boolean
 *               is_vulnerable:
 *                 type: boolean
 *               course_completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Visit updated successfully
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Visit not found
 *       500:
 *         description: Server error
 * 
 * /visits/family/{family_id}:
 *   get:
 *     summary: Fetch paginated visit history for a specific family
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: family_id
 *         in: path
 *         description: ID of the family to fetch history for
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Visit history fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     visits:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/HouseholdVisit'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
