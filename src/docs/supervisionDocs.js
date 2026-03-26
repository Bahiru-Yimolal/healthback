/**
 * @swagger
 * tags:
 *   name: Supervision
 *   description: Monitoring and Mentoring Visit Management
 */

/**
 * @swagger
 * /supervision:
 *   post:
 *     summary: Create a new supervision record
 *     tags: [Supervision]
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
 *               - evaluatee_id
 *               - unit_id
 *               - level
 *               - scores
 *             properties:
 *               evaluatee_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the staff member being supervised
 *               unit_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the administrative unit where supervision occurs
 *               level:
 *                 type: string
 *                 enum: [CITY, SUBCITY, HEALTH_CENTER]
 *               scores:
 *                 type: object
 *                 description: JSON object mapping indicator IDs to scores (0, 0.5, 1, or NA)
 *               na_explanations:
 *                 type: object
 *                 description: JSON object mapping indicator IDs to N/A reasons
 *               strong_points:
 *                 type: array
 *                 items:
 *                   type: string
 *               recommendations:
 *                 type: array
 *                 items:
 *                   type: string
 *               latitude:
 *                 type: number
 *                 format: float
 *                 description: Latitude coordinate of the visit
 *               longitude:
 *                 type: number
 *                 format: float
 *                 description: Longitude coordinate of the visit
 *               status:
 *                 type: string
 *                 enum: [DRAFT, COMPLETED]
 *                 default: COMPLETED
 *     responses:
 *       201:
 *         description: Supervision record created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /supervision/health-centers:
 *   get:
 *     summary: Fetch Health Center level supervisions (Hierarchical Access)
 *     tags: [Supervision]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - name: unit_id
 *         in: query
 *         description: Filter by specific Health Center ID
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [DRAFT, COMPLETED]
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
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
 *         description: Paginated list of Health Center supervisions
 *       403:
 *         description: Jurisdiction violation
 */

/**
 * @swagger
 * /supervision/sub-cities:
 *   get:
 *     summary: Fetch Sub-city level supervisions (Hierarchical Access)
 *     tags: [Supervision]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [DRAFT, COMPLETED]
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
 *         description: Paginated list of Sub-city supervisions
 */

/**
 * @swagger
 * /supervision/history/{evaluateeId}:
 *   get:
 *     summary: Get supervision history for a specific worker
 *     tags: [Supervision]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - in: path
 *         name: evaluateeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of previous supervision records
 *       404:
 *         description: Worker not found
 */

/**
 * @swagger
 * /supervision/latest/{evaluateeId}:
 *   get:
 *     summary: Get the latest supervision report for a worker
 *     tags: [Supervision]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - in: path
 *         name: evaluateeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of recent supervision records
 */

/**
 * @swagger
 * /supervision/evaluator/{evaluatorId}:
 *   get:
 *     summary: Get all supervision records performed by a specific evaluator
 *     tags: [Supervision]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - in: path
 *         name: evaluatorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the evaluator
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Paginated list of supervision records performed by the evaluator
 */

/**
 * @swagger
 * /supervision/{id}:
 *   put:
 *     summary: Update an existing supervision record
 *     tags: [Supervision]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the supervision record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scores:
 *                 type: object
 *                 description: JSON object mapping indicator IDs to scores
 *               na_explanations:
 *                 type: object
 *               strong_points:
 *                 type: array
 *                 items:
 *                   type: string
 *               recommendations:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, COMPLETED]
 *               latitude:
 *                 type: number
 *                 format: float
 *               longitude:
 *                 type: number
 *                 format: float
 *               next_appointment_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Supervision record updated successfully
 *       404:
 *         description: Record not found
 */

/**
 * @swagger
 * /supervision/{id}:
 *   delete:
 *     summary: Soft delete a supervision record
 *     tags: [Supervision]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the supervision record to delete
 *     responses:
 *       200:
 *         description: Supervision record deleted successfully
 *       404:
 *         description: Record not found
 */
