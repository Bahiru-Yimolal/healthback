/**
 * @swagger
 * /beneficiaries/filter:
 *   get:
 *     summary: Filter beneficiaries (pregnant, postpartum, child) with latest assessment and visit location.
 *     tags: [Beneficiaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pregnant, postpartum, child]
 *         description: Type of beneficiary to filter.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by head of household name or registration number.
 *       - in: query
 *         name: block_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: ketena_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: woreda_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: health_center_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: subcity_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: city_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: nutritional_status
 *         schema:
 *           type: string
 *           enum: [SAM, MAM, NORMAL, NA]
 *         description: (Children only) Filter by latest nutritional status.
 *       - in: query
 *         name: up_to_date_vaccination
 *         schema:
 *           type: string
 *           enum: [YES, NO, NA]
 *         description: (Children only) Filter by vaccination status.
 *       - in: query
 *         name: developmental_milestone
 *         schema:
 *           type: string
 *           enum: [ND, SD, DD]
 *         description: (Children only) Filter by developmental milestone.
 *       - in: query
 *         name: anc_followup_dropped
 *         schema:
 *           type: string
 *           enum: [YES, NO, NA]
 *         description: (Pregnant only) Filter by ANC dropout.
 *       - in: query
 *         name: pnc_followup_dropped
 *         schema:
 *           type: string
 *           enum: [YES, NO, NA]
 *         description: (Postpartum only) Filter by PNC dropout.
 *       - in: query
 *         name: referred_to_facility
 *         schema:
 *           type: boolean
 *         description: Filter by referral status.
 *       - in: query
 *         name: maternal_depression_signs
 *         schema:
 *           type: boolean
 *         description: Filter by signs of maternal depression.
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
 *         description: Beneficiaries filtered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 limit:
 *                   type: integer
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
 *                       latest_assessment:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           visit:
 *                             type: object
 *                             properties:
 *                               latitude:
 *                                 type: number
 *                               longitude:
 *                                 type: number
 *                               visit_date:
 *                                 type: string
 *                                 format: date
 *       400:
 *         description: Invalid input parameters.
 *       401:
 *         description: Unauthorized.
 */
