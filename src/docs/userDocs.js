/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Please enter JWT token in the format **Bearer &lt;token&gt;** to access this endpoint.
 *   parameters:
 *     acceptLanguageHeader:
 *       in: header
 *       name: Accept-Language
 *       schema:
 *         type: string
 *         enum: [eng, am, orm, som, tir, sid]
 *         default: eng
 *       description: Language preference for the response (e.g., eng, am, orm, som, tir, sid)
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               phone_number:
 *                 type: string
 *                 example: "0912345678"
 *               password:
 *                 type: string
 *                 example: "Password123!"
 *               language_preference:
 *                 type: string
 *                 enum: [eng, am, orm, som, tir, sid]
 *                 example: eng
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *                 message:
 *                   type: string
 *                   example: User registered successfully.
 *
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: string
 *                     format: uuid
 *                     example: "550e8400-e29b-41d4-a716-446655440000"
 *                   first_name:
 *                     type: string
 *                     example: John
 *                   last_name:
 *                     type: string
 *                     example: Doe
 *                   phone_number:
 *                     type: string
 *                     example: "0912345678"
 *                   status:
 *                     type: string
 *                     example: assigned
 *       401:
 *         description: Unauthorized, invalid token
 *       500:
 *         description: Internal server error
 */



/**
 * @swagger
 * /users/updateInfo:
 *   patch:
 *     summary: Update user details
 *     tags: [User]
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
 *               firstName:
 *                 type: string
 *                 example: Jane
 *               lastName:
 *                 type: string
 *                 example: Smith
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: "0912345678"
 *               username:
 *                 type: string
 *                 example: janedoe
 *               language_preference:
 *                 type: string
 *                 enum: [eng, am, orm, som, tir, sid]
 *                 example: eng
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *       401:
 *         description: Unauthorized, invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/updatePassword:
 *   patch:
 *     summary: Change the user's password
 *     tags: [User]
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
 *               currentPassword:
 *                 type: string
 *                 description: Current password of the user
 *                 example: "CurrentPassword123!"
 *               newPassword:
 *                 type: string
 *                 description: New password for the user
 *                 example: "NewPassword456!"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully.
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User Login
 *     tags: [User]
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "0912345678"
 *               password:
 *                 type: string
 *                 example: "Password123!"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     first_name:
 *                       type: string
 *                       example: "John"
 *                     last_name:
 *                       type: string
 *                       example: "Doe"
 *                     phone_number:
 *                       type: string
 *                       example: "0912345678"
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *                     language_preference:
 *                       type: string
 *                       enum: [eng, am, orm, som, tir, sid]
 *                       example: "eng"
 *                     role:
 *                       type: string
 *                       example: "Group Leader"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-30T12:00:00Z"
 *                     mustChangePassword:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Invalid credentials
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
 *                   example: "Invalid credentials"
 */


/**
 * @swagger
 * /users/forgot-password:
 *   post:
 *     summary: Request password reset link via email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Reset link sent to the provided email
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
 *                   example: Reset Link sent in your email
 *       404:
 *         description: Email not found in the system
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
 *                   example: No user found with this email
 */

/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     summary: Reset password using a valid token
 *     tags: [Authentication]
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
 *               password:
 *                 type: string
 *                 example: NewSecurePassword123!
 *     responses:
 *       200:
 *         description: Password reset successful
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
 *                   example: Password reset successfully
 *       400:
 *         description: Invalid or expired token
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
 *                   example: Token is invalid or expired
 *       404:
 *         description: User not found
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
 *                   example: No user found with this userId
 */


/**
 * @swagger
 * /users/sendBulkEmail:
 *   post:
 *     summary: Send a bulk email to multiple recipients
 *     tags: [User]
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
 *               subject:
 *                 type: string
 *                 example: Important Notification
 *               message:
 *                 type: string
 *                 example: This is the same message sent to multiple users.
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     full_name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Emails sent successfully
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
 *                   example: Email sent to 3 recipient(s).
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       batch:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             full_name:
 *                               type: string
 *                               example: John Doe
 *                             email:
 *                               type: string
 *                               example: john.doe@example.com
 *                       status:
 *                         type: string
 *                         example: sent
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/resetPassword/{phoneNumber}:
 *   patch:
 *     summary: Reset user password
 *     description: Resets the user's password to "Password@123". Only accessible by authenticated sub-city leaders.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The phone number of the user whose password is to be reset.
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *                   example: Password reset successfully to Password@123
 *                 data:
 *                   type: object
 *                   description: The updated user information or a confirmation object
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       403:
 *         description: Forbidden – user does not have access
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /users/resetPasswordById/{userId}:
 *   patch:
 *     summary: Reset user password by ID
 *     description: Resets the user's password to "Password123" by their user ID. Only accessible by authorized administrators.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user whose password is to be reset.
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *                   example: Password reset successfully to Password123
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /users/pendingStatus:
 *   get:
 *     summary: Get all users with pending status
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     responses:
 *       200:
 *         description: A list of users with pending status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: string
 *                     format: uuid
 *                     example: "550e8400-e29b-41d4-a716-446655440000"
 *                   first_name:
 *                     type: string
 *                     example: John
 *                   last_name:
 *                     type: string
 *                     example: Doe
 *                   phone_number:
 *                     type: string
 *                     example: "0912345678"
 *                   status:
 *                     type: string
 *                     example: assigned
 *       401:
 *         description: Unauthorized, invalid token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/language:
 *   patch:
 *     summary: Update user language preference
 *     tags: [User]
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
 *               language_preference:
 *                 type: string
 *                 enum: [eng, am, orm, som, tir, sid]
 *                 example: eng
 *     responses:
 *       200:
 *         description: Language preference updated successfully
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
 *                 language_preference:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get user details by ID
 *     description: Retrieve detailed information about a user by their unique user ID. Only accessible by authorized users.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique ID of the user.
 *     responses:
 *       200:
 *         description: User details retrieved successfully
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
 *                   example: User details retrieved successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     first_name:
 *                       type: string
 *                       example: John
 *                     last_name:
 *                       type: string
 *                       example: Doe
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     phone_number:
 *                       type: string
 *                       example: "+251911234567"
 *                     language_preference:
 *                       type: string
 *                       example: "eng"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /users/login-info:
 *   get:
 *     summary: Get login statistics and history for the current user
 *     description: Retrieve successful/failed login counts, last login details, and recent 5 login attempts.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     responses:
 *       200:
 *         description: Login information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     success_count:
 *                       type: integer
 *                       example: 15
 *                     failed_count:
 *                       type: integer
 *                       example: 2
 *                     last_successful_login:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         login_at:
 *                           type: string
 *                           format: date-time
 *                         ip_address:
 *                           type: string
 *                           example: "127.0.0.1"
 *                         user_agent:
 *                           type: string
 *                     last_failed_login:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         login_at:
 *                           type: string
 *                           format: date-time
 *                         ip_address:
 *                           type: string
 *                         user_agent:
 *                           type: string
 *                         failure_reason:
 *                           type: string
 *                     recent_history:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           login_at:
 *                             type: string
 *                           ip_address:
 *                             type: string
 *                           user_agent:
 *                             type: string
 *                           status:
 *                             type: string
 *                           failure_reason:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete a user (UNASSIGNED status only)
 *     description: Permanently delete a user from the system. This is only allowed for users who have not yet been assigned to any units or roles (status must be UNASSIGNED).
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique ID of the user to delete.
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: User deleted successfully.
 *       400:
 *         description: Cannot delete assigned or active user
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /users/{userId}/deactivate:
 *   patch:
 *     summary: Deactivate a user
 *     description: Change user status to DEACTIVATED, preventing them from logging in.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique ID of the user to deactivate.
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /users/{userId}/activate:
 *   patch:
 *     summary: Activate a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to activate
 *     responses:
 *       200:
 *         description: User activated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
/**
 * @swagger
 * /users/{userId}/deactivate:
 *   patch:
 *     summary: Deactivate a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to deactivate
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /users/me/context:
 *   get:
 *     summary: Get user's administrative context
 *     description: Returns the user's role, administrative level, and the full location path (from Block up to City) for the unit they are assigned to.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     responses:
 *       200:
 *         description: User context retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *                 role:
 *                   type: string
 *                   example: "PC Worker"
 *                 level:
 *                   type: string
 *                   example: "BLOCK"
 *                 location_path:
 *                   type: object
 *                   description: Map of administrative levels to their IDs and names
 *                 assigned_units:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       wereda_id: { type: string, format: uuid }
 *                       name: { type: string }
 *                       ketenas:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             ketena_id: { type: string, format: uuid }
 *                             name: { type: string }
 *                             blocks:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   block_id: { type: string, format: uuid }
 *                                   name: { type: string }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User not assigned to any unit
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/me/hierarchy:
 *   get:
 *     summary: Get accessible administrative hierarchy
 *     description: Returns the full nested tree of administrative units accessible to the current user, scoped to their assigned level.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguageHeader'
 *     responses:
 *       200:
 *         description: User hierarchy retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 level:
 *                   type: string
 *                   example: "WOREDA"
 *                 unit:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     name: { type: string }
 *                     level: { type: string }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
