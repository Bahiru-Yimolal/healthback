/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Activity and assessment reporting
 */

/**
 * @swagger
 * /reports/worker:
 *   get:
 *     summary: Get PC Worker level activity and assessment report
 *     description: Returns a detailed summary of activities (households) and assessments (pregnant, postnatal, child) for a specific PC Worker within a date range.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *         description: ID of the PC Worker to generate the report for
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         example: "2024-03-01"
 *         description: Start date for the report (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         example: "2024-03-31"
 *         description: End date for the report (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Report generated successfully
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
 *                     section_1:
 *                       type: object
 *                       description: Service Coverage (Households)
 *                     section_2:
 *                       type: object
 *                       description: Pregnant Women
 *                     section_3:
 *                       type: object
 *                       description: Postnatal Women
 *                     section_4:
 *                       type: object
 *                       description: Child (<6 years)
 *                     section_5:
 *                       type: object
 *                       description: Care Giving Behaviors
 *       400:
 *         description: Missing required fields (startDate or endDate)
 *       401:
 *         description: Unauthorized - Valid token required
 *       500:
 *         description: Internal server error
 * 
 * /reports/aggregate:
 *   get:
 *     summary: Get Aggregate activity and assessment report for higher levels
 *     description: Returns a detailed summary of activities and assessments for a specific administrative unit (HC, Subcity, City, or Ethiopia) within a date range.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *         description: ID of the Administrative Unit (Health Center, Subcity, etc.) to aggregate results for.
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         example: "2024-03-01"
 *         description: Start date for the report (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         example: "2024-03-31"
 *         description: End date for the report (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Aggregate report generated successfully
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
 *                     section_1:
 *                       type: object
 *                     section_2:
 *                       type: object
 *                     section_3:
 *                       type: object
 *                     section_4:
 *                       type: object
 *                     section_5:
 *                       type: object
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
