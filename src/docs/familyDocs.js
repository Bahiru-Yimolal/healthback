/**
 * @swagger
 * tags:
 *   name: Families
 *   description: Household and Dependent registration endpoints
 */

/**
 * @swagger
 * /families:
 *   post:
 *     summary: Register a new Family and all dependents
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - block_id
 *               - registration_number
 *               - head_of_household_name
 *               - health_insurance_type
 *             properties:
 *               block_id:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               registration_number:
 *                 type: string
 *                 example: "Aq/A11/B20/001"
 *               house_number:
 *                 type: string
 *                 example: "123"
 *               head_of_household_name:
 *                 type: string
 *                 example: "Abebe Kebede"
 *               phone_number:
 *                 type: string
 *                 example: "0911223344"
 *               is_vulnerable:
 *                 type: boolean
 *                 example: true
 *               is_safetynet_beneficiary:
 *                 type: boolean
 *                 example: false
 *               health_insurance_type:
 *                 type: string
 *                 enum: [FREE_OR_SPONSORED, PAYING, NOT_BENEFICIARY]
 *                 example: "FREE_OR_SPONSORED"
 *               is_temporary_direct_support_beneficiary:
 *                 type: boolean
 *                 example: false
 *               latitude:
 *                 type: number
 *                 example: 9.005401
 *               longitude:
 *                 type: number
 *                 example: 38.763611
 *               guardian_name:
 *                 type: string
 *                 example: "Almaz"
 *               guardian_gender:
 *                 type: string
 *                 enum: [MALE, FEMALE]
 *                 example: "FEMALE"
 *               guardian_dob:
 *                 type: string
 *                 format: date
 *                 example: "1980-05-12"
 *               guardian_phone_number:
 *                 type: string
 *                 example: "0922334455"
 *               pregnant_mother:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Aster Abebe"
 *                   dob:
 *                     type: string
 *                     format: date
 *                     example: "1995-10-21"
 *               lactating_mother:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Tigist Abebe"
 *                   dob:
 *                     type: string
 *                     format: date
 *                     example: "1998-02-14"
 *               children:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Biniyam Abebe"
 *                     gender:
 *                       type: string
 *                       enum: [MALE, FEMALE]
 *                       example: "MALE"
 *                     dob:
 *                       type: string
 *                       format: date
 *                       example: "2021-03-15"
 *                     vulnerable_to_growth_restriction:
 *                       type: boolean
 *                       example: false
 *     responses:
 *       201:
 *         description: Family created successfully
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
 *                   example: "Family created successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error or duplicate registration number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Block not found or outside jurisdiction
 *       500:
 *         description: Internal server error creating family
 * 
 * /families/{id}:
 *   get:
 *     summary: Fetch a specific Family record by ID including dependents
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Family UUID to fetch
 *     responses:
 *       200:
 *         description: Family record fetched successfully
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
 *                   example: "Family record fetched successfully"
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Family not found or outside jurisdiction
 *       500:
 *         description: Internal server error fetching family
 *
 *   put:
 *     summary: Update an existing Family and its dependents
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The existing Family UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               block_id:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               registration_number:
 *                 type: string
 *                 example: "Aq/A11/B20/001"
 *               house_number:
 *                 type: string
 *                 example: "123"
 *               head_of_household_name:
 *                 type: string
 *                 example: "Abebe Kebede (Updated)"
 *               phone_number:
 *                 type: string
 *                 example: "0911223344"
 *               is_vulnerable:
 *                 type: boolean
 *                 example: true
 *               is_safetynet_beneficiary:
 *                 type: boolean
 *                 example: false
 *               health_insurance_type:
 *                 type: string
 *                 enum: [FREE_OR_SPONSORED, PAYING, NOT_BENEFICIARY]
 *                 example: "PAYING"
 *               is_temporary_direct_support_beneficiary:
 *                 type: boolean
 *                 example: false
 *               latitude:
 *                 type: number
 *                 example: 9.005401
 *               longitude:
 *                 type: number
 *                 example: 38.763611
 *               guardian_name:
 *                 type: string
 *                 example: "Almaz"
 *               guardian_gender:
 *                 type: string
 *                 enum: [MALE, FEMALE]
 *               guardian_dob:
 *                 type: string
 *                 format: date
 *               guardian_phone_number:
 *                 type: string
 *               pregnant_mother:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   dob:
 *                     type: string
 *                     format: date
 *                 nullable: true
 *               lactating_mother:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   dob:
 *                     type: string
 *                     format: date
 *                 nullable: true
 *               children:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     gender:
 *                       type: string
 *                       enum: [MALE, FEMALE]
 *                     dob:
 *                       type: string
 *                       format: date
 *                     vulnerable_to_growth_restriction:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Family updated successfully
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
 *                   example: "Family updated successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error or invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Family or Block not found
 *       500:
 *         description: Internal server error updating
 *
 *   delete:
 *     summary: Delete a Family record and its dependents
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Family UUID to delete
 *     responses:
 *       200:
 *         description: Family deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (PC Worker can only delete their own creation)
 *       404:
 *         description: Family not found
 *       500:
 *         description: Internal server error deleting family
 *
 * /families/creator/{creatorId}:
 *   get:
 *     summary: Fetch families registered by a specific user (with pagination)
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: creatorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user who registered the families
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
 *         description: Successfully fetched families registered by the user
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
 *                   example: "Families registered by the user fetched successfully"
 *                 total:
 *                   type: integer
 *                   example: 50
 *                 pages:
 *                   type: integer
 *                   example: 5
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 families:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Family'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       500:
 *         description: Internal server error fetching families by creator
 *
 * /families/filter:
 *   get:
 *     summary: Fetch families filtered by administrative units (Woreda, Ketena, Block, etc.)
 *     description: Retrieve families based on administrative filters. All parameters are optional; if none are provided, the results will default to the administrative units assigned to the logged-in user.
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: city_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by City ID
 *       - in: query
 *         name: subcity_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by Subcity ID
 *       - in: query
 *         name: health_center_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by Health Center ID
 *       - in: query
 *         name: woreda_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by Woreda ID
 *       - in: query
 *         name: ketena_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by Ketena ID
 *       - in: query
 *         name: block_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by Block ID (Most specific)
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
 *         description: Successfully fetched filtered families
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 total:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 families:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Family'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error filtering families
 *
 * /families/assigned/me:
 *   get:
 *     summary: Fetch families assigned to the current PC Worker (based on assignments)
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Successfully fetched assigned families
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Assigned families fetched successfully"
 *                 total:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 families:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Family'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error fetching assigned families
 */
