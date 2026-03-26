/**
 * @swagger
 * tags:
 *   name: Assessments
 *   description: Household member health assessments
 */

/**
 * @swagger
 * /assessments/pregnant:
 *   post:
 *     summary: Record a pregnant mother assessment during a visit
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visit_id
 *               - mother_id
 *               - anc_followup_started
 *               - anc_followup_dropped
 *               - iron_folic_acid_supplement
 *             properties:
 *               visit_id:
 *                 type: string
 *                 format: uuid
 *               mother_id:
 *                 type: string
 *                 format: uuid
 *               anc_followup_started:
 *                 type: string
 *                 enum: [YES, NO, NA]
 *               anc_followup_dropped:
 *                 type: string
 *                 enum: [YES, NO, NA]
 *               substance_use:
 *                 type: boolean
 *               substance_type:
 *                 type: string
 *               maternal_depression_signs:
 *                 type: boolean
 *               diverse_diet_extra_meal:
 *                 type: boolean
 *               iron_folic_acid_supplement:
 *                 type: string
 *                 enum: [YES, NO, NA]
 *               partner_family_support:
 *                 type: boolean
 *               violence_signs:
 *                 type: boolean
 *               fetal_stimulation_activities:
 *                 type: array
 *                 items:
 *                   type: string
 *               referred_to_facility:
 *                 type: boolean
 *               referral_reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pregnant assessment created successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Visit or Mother not found
 *       500:
 *         description: Server error
 *
 * /assessments/pregnant/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       description: Assessment ID
 *   patch:
 *     summary: Update an existing pregnant mother assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               anc_followup_started:
 *                 type: string
 *                 enum: [YES, NO, NA]
 *               anc_followup_dropped:
 *                 type: string
 *                 enum: [YES, NO, NA]
 *               substance_use:
 *                 type: boolean
 *               substance_type:
 *                 type: string
 *               maternal_depression_signs:
 *                 type: boolean
 *               diverse_diet_extra_meal:
 *                 type: boolean
 *               iron_folic_acid_supplement:
 *                 type: string
 *                 enum: [YES, NO, NA]
 *               partner_family_support:
 *                 type: boolean
 *               violence_signs:
 *                 type: boolean
 *               fetal_stimulation_activities:
 *                 type: array
 *                 items:
 *                   type: string
 *               referred_to_facility:
 *                 type: boolean
 *               referral_reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pregnant assessment updated successfully
 *       400:
 *         description: Bad request or Referral already processed
 *       404:
 *         description: Assessment not found
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get a single pregnant assessment by ID
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pregnant assessment retrieved successfully
 *       404:
 *         description: Assessment not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a pregnant assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Pregnant assessment deleted successfully
 *       400:
 *         description: Cannot delete assessment (e.g. referral already processed)
 *       404:
 *         description: Assessment not found
 *       500:
 *         description: Server error
 *
 * /assessments/postnatal:
 *   post:
 *     summary: Record a postnatal mother assessment during a visit
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visit_id
 *               - mother_id
 *               - pnc_followup_started
 *               - pnc_followup_dropped
 *             properties:
 *               visit_id:
 *                 type: string
 *                 format: uuid
 *               mother_id:
 *                 type: string
 *                 format: uuid
 *               pnc_followup_started:
 *                 type: string
 *                 enum: [YES, NO, NA]
 *               pnc_followup_dropped:
 *                 type: string
 *                 enum: [YES, NO, NA]
 *               health_danger_signs:
 *                 type: boolean
 *               substance_use:
 *                 type: boolean
 *               maternal_depression_signs:
 *                 type: boolean
 *               diverse_diet_extra_meal:
 *                 type: boolean
 *               iron_folic_acid_supplement:
 *                 type: boolean
 *               partner_family_support:
 *                 type: boolean
 *               violence_signs:
 *                 type: boolean
 *               newborn_stimulation_activities:
 *                 type: array
 *                 items:
 *                   type: string
 *               referred_to_facility:
 *                 type: boolean
 *               referral_reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Postnatal assessment created successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Visit or Mother not found
 *       500:
 *         description: Server error
 *
 * /assessments/postnatal/{id}:
 *   get:
 *     summary: Get a postnatal assessment by ID
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Postnatal assessment details fetched successfully
 *       404:
 *         description: Assessment not found
 *       500:
 *         description: Server error
 *   patch:
 *     summary: Update an existing postnatal assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pnc_followup_started:
 *                 type: string
 *                 enum: [YES, NO, NA]
 *               pnc_followup_dropped:
 *                 type: string
 *                 enum: [YES, NO, NA]
 *               health_danger_signs:
 *                 type: boolean
 *               substance_use:
 *                 type: boolean
 *               maternal_depression_signs:
 *                 type: boolean
 *               diverse_diet_extra_meal:
 *                 type: boolean
 *               iron_folic_acid_supplement:
 *                 type: boolean
 *               partner_family_support:
 *                 type: boolean
 *               violence_signs:
 *                 type: boolean
 *               newborn_stimulation_activities:
 *                 type: array
 *                 items:
 *                   type: string
 *               referred_to_facility:
 *                 type: boolean
 *               referral_reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Postnatal assessment updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Assessment not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a postnatal assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Postnatal assessment deleted successfully
 *       400:
 *         description: Cannot delete assessment (e.g. referral already processed)
 *       404:
 *         description: Assessment not found
 *       500:
 *         description: Server error
 *
 * /assessments/child:
 *   post:
 *     summary: Record a child assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visit_id
 *               - child_id
 *               - talk_sing_frequency
 *               - play_frequency
 *               - story_read_frequency
 *               - outdoor_play_frequency
 *               - up_to_date_vaccination
 *               - nutritional_status
 *               - developmental_milestone
 *             properties:
 *               visit_id:
 *                 type: string
 *                 format: uuid
 *               child_id:
 *                 type: string
 *                 format: uuid
 *               talk_sing_frequency:
 *                 type: integer
 *               play_frequency:
 *                 type: integer
 *               story_read_frequency:
 *                 type: integer
 *               outdoor_play_frequency:
 *                 type: integer
 *               responsive_care:
 *                 type: boolean
 *               positive_discipline:
 *                 type: array
 *                 items:
 *                   type: string
 *               up_to_date_vaccination:
 *                 type: string
 *                 enum: [YES, NO, NA]
 *               feeding_status:
 *                 type: array
 *                 items:
 *                   type: string
 *               nutritional_status:
 *                 type: string
 *                 enum: [SAM, MAM, NORMAL, NA]
 *               abuse_violence_signs:
 *                 type: boolean
 *               abuse_violence_specification:
 *                 type: string
 *               developmental_milestone:
 *                 type: string
 *                 enum: [ND, SD, DD]
 *               disability_screening:
 *                 type: array
 *                 items:
 *                   type: string
 *               has_books:
 *                 type: boolean
 *               plays_with_toys:
 *                 type: boolean
 *               toy_type:
 *                 type: string
 *                 enum: [HOMEMADE, SHOP, BOTH, NA]
 *               referred_to_facility:
 *                 type: boolean
 *               referral_reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Child assessment recorded successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Visit or Child not found
 *       500:
 *         description: Server error
 *
 * /assessments/child/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       description: Assessment ID
 *   patch:
 *     summary: Update a child assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               talk_sing_frequency:
 *                 type: integer
 *               play_frequency:
 *                 type: integer
 *               story_read_frequency:
 *                 type: integer
 *               outdoor_play_frequency:
 *                 type: integer
 *               responsive_care:
 *                 type: boolean
 *               positive_discipline:
 *                 type: array
 *                 items:
 *                   type: string
 *               up_to_date_vaccination:
 *                 type: string
 *                 enum: [YES, NO, NA]
 *               feeding_status:
 *                 type: array
 *                 items:
 *                   type: string
 *               nutritional_status:
 *                 type: string
 *                 enum: [SAM, MAM, NORMAL, NA]
 *               abuse_violence_signs:
 *                 type: boolean
 *               abuse_violence_specification:
 *                 type: string
 *               developmental_milestone:
 *                 type: string
 *                 enum: [ND, SD, DD]
 *               disability_screening:
 *                 type: array
 *                 items:
 *                   type: string
 *               has_books:
 *                 type: boolean
 *               plays_with_toys:
 *                 type: boolean
 *               toy_type:
 *                 type: string
 *                 enum: [HOMEMADE, SHOP, BOTH, NA]
 *               referred_to_facility:
 *                 type: boolean
 *               referral_reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Child assessment updated successfully
 *       400:
 *         description: Bad request (e.g. referral already processed)
 *       404:
 *         description: Assessment not found
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get child assessment by ID
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Child assessment details
 *       404:
 *         description: Assessment not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a child assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Child assessment deleted successfully
 *       400:
 *         description: Bad request (e.g. referral already processed)
 *       404:
 *         description: Assessment not found
 *       500:
 *         description: Server error
 */
