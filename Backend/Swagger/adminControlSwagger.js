/**
 * @swagger
 * /adminapi/login:
 *   post:
 *     summary: Admin login endpoint
 *     description: Allows an admin to log in using email, password, and optional 2FA code.
 *     tags: 
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Admin email address
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 description: Admin password
 *                 example: "password123"
 *               twoFACode:
 *                 type: string
 *                 description: Two-factor authentication code (optional)
 *                 example: "123456"
 *               loginHistory:
 *                 type: object
 *                 description: Login history data (optional)
 *                 properties:
 *                   ipAddress:
 *                     type: string
 *                     description: IP address of the login attempt
 *                   device:
 *                     type: string
 *                     description: Device information
 *     responses:
 *       200:
 *         description: Login successful or 2FA required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   description: Indicates if 2FA is required
 *                   example: "TWO_FA"
 *                 message:
 *                   type: string
 *                   example: "Need 2FA code"
 *                 token:
 *                   type: string
 *                   description: JWT token if login is successful
 *       400:
 *         description: Invalid credentials or 2FA code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: object
 *                   properties:
 *                     password:
 *                       type: string
 *                       example: "Password incorrect"
 *                     email:
 *                       type: string
 *                       example: "Email not found"
 *                 message:
 *                   type: string
 *                   example: "Invalid 2FA code"
 *       404:
 *         description: Email not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "Email not found"
 *       500:
 *         description: Server error
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
 *                   example: "Error on server"
 */


/**
 * @swagger
 * /adminapi/subAdmin:
 *   get:
 *     summary: Retrieve a list of admin users
 *     description: This endpoint fetches a list of all users with the role 'admin' and their basic details like name, email, and restriction status.
 *     tags: 
 *       - Admin
 *     responses:
 *       200:
 *         description: Successfully fetched admin data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "johndoe@example.com"
 *                       restriction:
 *                         type: string
 *                         example: "none"
 *       500:
 *         description: Error on the server while fetching admin data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: string
 *                       example: "Error on server"
 */

  
/**
 * @swagger
 * /adminapi/sub-admin:
 *   post:
 *     summary: Create a new admin
 *     description: This endpoint creates a new admin user. Only non-admin users can create an admin, and the email must not already exist in the database.
 *     tags: 
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "securepassword123"
 *               role:
 *                 type: string
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: Successfully created admin user
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
 *                   example: "Admin created successfully"
 *       400:
 *         description: Invalid request data or admin creation failure
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
 *                   example: "Failed"
 *       401:
 *         description: Unauthorized if trying to create an admin by a non-admin user
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
 *                   example: "super Admin Only created"
 *       500:
 *         description: Error on the server during admin creation
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
 *                   example: "something went wrong"
 */


/**
 * @swagger
 * /adminapi/edit-admin:
 *   put:
 *     summary: Edit an existing admin user
 *     description: This endpoint allows you to update the details of an existing admin. Only non-admin users can update an admin, and the email must be valid.
 *     tags: 
 *       - Admin
 *     parameters:
 *       - in: body
 *         name: adminDetails
 *         description: The admin data that needs to be updated
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             adminId:
 *               type: string
 *               example: "60c72b2f9e1d5b001f7c63e4"
 *             name:
 *               type: string
 *               example: "John Doe"
 *             email:
 *               type: string
 *               example: "john.doe@example.com"
 *             restriction:
 *               type: string
 *               example: "restricted"
 *     responses:
 *       200:
 *         description: Successfully updated admin user
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
 *                   example: "Updated successfully"
 *       400:
 *         description: Invalid request data or update failure
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
 *                   example: "Update failed"
 *       401:
 *         description: Unauthorized if trying to update an admin by a non-admin user or if the admin ID is invalid
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
 *                   example: "Super Admin only update"
 *       500:
 *         description: Error on the server during admin update
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
 *                   example: "Error on server"
 */


/**
 * @swagger
 * /adminapi/login-history:
 *   get:
 *     summary: Retrieve login history
 *     description: Fetches login history records with optional pagination or exports all records based on the `export` query parameter.
 *     tags: 
 *       - Admin
 *     parameters:
 *       - in: query
 *         name: export
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Specifies whether to export all data or fetch paginated results.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number for paginated results (only applicable if `export` is `true`).
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *         description: The number of results per page (only applicable if `export` is `true`).
 *       - in: query
 *         name: countryName
 *         required: false
 *         schema:
 *           type: string
 *           example: "United States"
 *         description: Filter records by country name.
 *       - in: query
 *         name: regionName
 *         required: false
 *         schema:
 *           type: string
 *           example: "California"
 *         description: Filter records by region name.
 *       - in: query
 *         name: broswername
 *         required: false
 *         schema:
 *           type: string
 *           example: "Chrome"
 *         description: Filter records by browser name.
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           example: "success"
 *         description: Filter records by login status.
 *     responses:
 *       200:
 *         description: Successful retrieval of login history
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
 *                   example: "FETCH_SUCCESS"
 *                 result:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 100
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           countryCode:
 *                             type: string
 *                             example: "US"
 *                           countryName:
 *                             type: string
 *                             example: "United States"
 *                           regionName:
 *                             type: string
 *                             example: "California"
 *                           ipaddress:
 *                             type: string
 *                             example: "192.168.1.1"
 *                           broswername:
 *                             type: string
 *                             example: "Chrome"
 *                           ismobile:
 *                             type: boolean
 *                             example: false
 *                           os:
 *                             type: string
 *                             example: "Windows 10"
 *                           status:
 *                             type: string
 *                             example: "success"
 *                           reason:
 *                             type: string
 *                             example: "Authentication successful"
 *                           createdDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-11-18T12:34:56Z"
 *       500:
 *         description: Server error
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
 *                   example: "SOMETHING_WRONG"
 */


/**
 * @swagger
 * /adminapi/get-profile:
 *   get:
 *     summary: Fetch user profile
 *     description: Retrieves the profile of the currently authenticated user based on their token.
 *     tags: 
 *       - Admin
 *     responses:
 *       200:
 *         description: Successful retrieval of user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     role:
 *                       type: string
 *                       example: "admin"
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Profile not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 */


/**
 * @swagger
 * /adminapi/change-password:
 *   post:
 *     summary: Change the admin user's password
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "OldPassword123!"
 *                 description: The current password of the user.
 *               newPassword:
 *                 type: string
 *                 example: "NewPassword123!"
 *                 description: The new password the user wants to set.
 *               otp:
 *                 type: string
 *                 example: "123456"
 *                 description: The OTP sent to the user.
 *     responses:
 *       200:
 *         description: Password successfully updated.
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
 *                   example: "Password Updated"
 *       400:
 *         description: Validation or input error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: object
 *                   properties:
 *                     oldPassword:
 *                       type: string
 *                       example: "incorrect password"
 *                     otp:
 *                       type: string
 *                       example: "invalid OTP"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "something worng"
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     GenerateOTPResponse:
 *       type: object
 *       properties:
 *         OTP:
 *           type: string
 *           example: "12345"
 *           description: The generated 5-digit OTP.
 *
 * /adminapi/send-mail:
 *   get:
 *     summary: Middleware to generate a 5-digit OTP
 *     tags:
 *       - Utility
 *     responses:
 *       200:
 *         description: OTP generated successfully and attached to the request object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenerateOTPResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "catch err"
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     SendMailRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: "user@example.com"
 *           description: The email address to send the OTP to.
 *     SendMailResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "OTP successfully sent to your email"
 *
 * /adminapi/send-mail:
 *   post:
 *     summary: Send an OTP email to the user
 *     tags:
 *       - Email Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMailRequest'
 *     responses:
 *       200:
 *         description: OTP successfully sent to the user's email.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SendMailResponse'
 *       400:
 *         description: Failed to send the OTP email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "something went wrong"
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the contact message.
 *           example: "648726"
 *         email:
 *           type: string
 *           description: The email address of the user who submitted the contact message.
 *           example: "user@example.com"
 *         message:
 *           type: string
 *           description: The message submitted by the user.
 *           example: "This is a sample message."
 *         created_date:
 *           type: string
 *           format: date-time
 *           description: The date and time the contact message was created.
 *           example: "2024-11-17T12:00:00Z"
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total number of records.
 *           example: 100
 *         limit:
 *           type: integer
 *           description: The number of records per page.
 *           example: 10
 *         skip:
 *           type: integer
 *           description: The number of records skipped.
 *           example: 0
 *     GetContactResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         result:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *             pagination:
 *               $ref: '#/components/schemas/Pagination'
 *
 * /adminapi/get-contact:
 *   get:
 *     summary: Fetch a list of contact messages with pagination and filters.
 *     tags:
 *       - Contact Admin
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email address.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: The number of records to retrieve.
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           example: 0
 *         description: The number of records to skip.
 *     responses:
 *       200:
 *         description: Successfully retrieved contact messages.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetContactResponse'
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid request."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */



/**
 * @swagger
 * components:
 *   schemas:
 *     AdminRlyRequest:
 *       type: object
 *       properties:
 *         rly:
 *           type: string
 *           description: The value for the "rly" field, which is required.
 *           example: "some value"
 *     AdminRlyErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: false
 *         errors:
 *           type: object
 *           properties:
 *             rly:
 *               type: string
 *               example: "Required"
 * /adminapi/admin-rly:
 *   post:
 *     summary: Middleware to validate the "rly" field in the request body.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminRlyRequest'
 *     responses:
 *       200:
 *         description: Success, validation passed, proceed to the next middleware.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request, validation failed for "rly".
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminRlyErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred."
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     AdminMsgRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The ID of the contact entry to update.
 *           example: "60d4c39a44d42c1b2b1a95d5"
 *         rly:
 *           type: string
 *           description: The reply message from the admin.
 *           example: "Thank you for reaching out! We have resolved your issue."
 *     AdminMsgResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Reply Email sent Successfully"
 *     AdminMsgErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Reply failed"
 * /adminapi/admin-rly:
 *   post:
 *     summary: Admin replies to a contact us message and sends an email.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminMsgRequest'
 *     responses:
 *       200:
 *         description: Reply email successfully sent to the user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminMsgResponse'
 *       400:
 *         description: Failed to send a reply.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminMsgErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Something wrong"
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     OrderHistoryResponse:
 *       type: object
 *       properties:
 *         orderDate:
 *           type: string
 *           description: The date when the order was placed.
 *           example: "2024-11-18 15:30"
 *         firstCurrency:
 *           type: string
 *           description: The first currency in the trade (e.g., USD, BTC).
 *           example: "USD"
 *         secondCurrency:
 *           type: string
 *           description: The second currency in the trade (e.g., BTC, ETH).
 *           example: "BTC"
 *         orderType:
 *           type: string
 *           description: The type of the order (e.g., Limit, Market).
 *           example: "Limit"
 *         buyorsell:
 *           type: string
 *           description: Whether the order was a buy or sell.
 *           example: "Buy"
 *         averagePrice:
 *           type: number
 *           description: The average price of the filled order.
 *           example: 10000.50
 *         price:
 *           type: number
 *           description: The price of the order.
 *           example: 10000
 *         filledQuantity:
 *           type: number
 *           description: The quantity of the order that was filled.
 *           example: 0.5
 *         quantity:
 *           type: number
 *           description: The total quantity of the order.
 *           example: 1
 *         orderValue:
 *           type: number
 *           description: The total value of the order.
 *           example: 5000
 *         conditionalType:
 *           type: string
 *           description: The conditional type of the order.
 *           example: "Stop Loss"
 *         status:
 *           type: string
 *           description: The status of the order (e.g., Completed, Pending).
 *           example: "Completed"
 *     DepositHistoryResponse:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The email address of the user making the deposit.
 *           example: "user@example.com"
 *         currencySymbol:
 *           type: string
 *           description: The symbol of the currency being deposited.
 *           example: "USD"
 *         userAssetId:
 *           type: string
 *           description: The unique identifier for the user's asset.
 *           example: "12345"
 *         image:
 *           type: string
 *           description: The image URL related to the deposit.
 *           example: "https://server.com/assets/deposit-image.jpg"
 *         actualAmount:
 *           type: number
 *           description: The actual amount deposited.
 *           example: 1000
 *         amount:
 *           type: number
 *           description: The amount of the deposit.
 *           example: 1000
 *         txid:
 *           type: string
 *           description: The transaction ID of the deposit.
 *           example: "abc123xyz"
 *         toaddress:
 *           type: string
 *           description: The address to which the deposit was made.
 *           example: "1A2B3C4D5E6F7G8H9I"
 *         status:
 *           type: string
 *           description: The status of the deposit (e.g., Success, Failed).
 *           example: "Success"
 *         paymentType:
 *           type: string
 *           description: The type of payment (e.g., coin_deposit, fiat_deposit).
 *           example: "coin_deposit"
 *         createdAt:
 *           type: string
 *           description: The date when the deposit was made.
 *           example: "2024-11-18 15:30"
 *     WithdrawHistoryResponse:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The email address of the user making the withdrawal.
 *           example: "user@example.com"
 *         currencySymbol:
 *           type: string
 *           description: The symbol of the currency being withdrawn.
 *           example: "BTC"
 *         amount:
 *           type: number
 *           description: The amount being withdrawn.
 *           example: 0.5
 *         actualAmount:
 *           type: number
 *           description: The actual amount withdrawn.
 *           example: 0.5
 *         commissionFee:
 *           type: number
 *           description: The commission fee for the withdrawal.
 *           example: 0.01
 *         bankDetail:
 *           type: string
 *           description: Bank details for fiat withdrawals.
 *           example: "Bank Name: XYZ Bank"
 *         txid:
 *           type: string
 *           description: The transaction ID of the withdrawal.
 *           example: "xyz123abc"
 *         toaddress:
 *           type: string
 *           description: The address to which the withdrawal was made.
 *           example: "1A2B3C4D5E6F7G8H9I"
 *         status:
 *           type: string
 *           description: The status of the withdrawal (e.g., Success, Failed).
 *           example: "Success"
 *         paymentType:
 *           type: string
 *           description: The type of payment (e.g., coin_withdraw, fiat_withdraw).
 *           example: "coin_withdraw"
 *         createdAt:
 *           type: string
 *           description: The date when the withdrawal was made.
 *           example: "2024-11-18 15:30"
 * /adminapi/get-history:
 *   get:
 *     summary: Get user trade, deposit, and withdrawal history.
 *     tags:
 *       - Admin History
 *     responses:
 *       200:
 *         description: History successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 result:
 *                   type: object
 *                   properties:
 *                     orderHistory:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OrderHistoryResponse'
 *                     depositHistory:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DepositHistoryResponse'
 *                     withdrawHistory:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WithdrawHistoryResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "An error occurred while retrieving history."
 */


/**
 * @swagger
 * /adminapi/total-count:
 *   get:
 *     summary: Get total counts of users, KYC, contact requests, support tickets, and transactions.
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Successfully fetched the total counts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: 'success'
 *                 totalCount:
 *                   type: object
 *                   properties:
 *                     userCount:
 *                       type: integer
 *                       example: 100
 *                     kycCount:
 *                       type: integer
 *                       example: 5
 *                     contactCount:
 *                       type: integer
 *                       example: 10
 *                     supportCount:
 *                       type: integer
 *                       example: 3
 *                     transCount:
 *                       type: integer
 *                       example: 2
 *                     depositCount:
 *                       type: integer
 *                       example: 4
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: 'error'
 *                 message:
 *                   type: string
 *                   example: 'Something went wrong'
 */


/**
 * @swagger
 * tags:
 *   name: Currency
 *   description: Currency management operations
 */

/**
 * @swagger
 * path:
 *  /adminapi/currency:
 *    get:
 *      summary: Get a list of currencies
 *      description: Returns a list of currencies with options to filter and export in CSV, XLS, or PDF formats.
 *      tags: 
 *       - Admin Currency
 *      parameters:
 *        - name: name
 *          in: query
 *          description: Name of the currency to filter by
 *          required: false
 *          schema:
 *            type: string
 *        - name: coin
 *          in: query
 *          description: Coin type to filter by
 *          required: false
 *          schema:
 *            type: string
 *        - name: type
 *          in: query
 *          description: Type of the currency to filter by
 *          required: false
 *          schema:
 *            type: string
 *        - name: status
 *          in: query
 *          description: Currency status to filter by
 *          required: false
 *          schema:
 *            type: string
 *        - name: export
 *          in: query
 *          description: The type of file to export (csv, xls, pdf)
 *          required: false
 *          schema:
 *            type: string
 *            enum: [csv, xls, pdf]
 *      responses:
 *        200:
 *          description: List of currencies
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: true
 *                  message:
 *                    type: string
 *                    example: "FETCH_SUCCESS"
 *                  result:
 *                    type: object
 *                    properties:
 *                      count:
 *                        type: integer
 *                        example: 100
 *                      data:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            name:
 *                              type: string
 *                              example: "Bitcoin"
 *                            coin:
 *                              type: string
 *                              example: "BTC"
 *                            type:
 *                              type: string
 *                              example: "crypto"
 *                            status:
 *                              type: string
 *                              example: "active"
 *        500:
 *          description: Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: false
 *                  message:
 *                    type: string
 *                    example: "SOMETHING_WRONG"
 */


/**
 * @swagger
 * tags:
 *   name: Currency
 *   description: Currency upload operations
 */

/**
 * @swagger
 * path:
 *  /adminapi/currency:
 *    post:
 *      summary: Upload a currency file
 *      description: This endpoint handles the upload of a currency file, such as a CSV or XLS file, and validates the content.
 *      tags: 
 *       - Admin Currency
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                file:
 *                  type: string
 *                  format: binary
 *                  description: The currency file to be uploaded
 *      responses:
 *        200:
 *          description: Successful file upload
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: true
 *                  message:
 *                    type: string
 *                    example: "UPLOAD_SUCCESS"
 *        400:
 *          description: Invalid input or file validation errors
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: false
 *                  errors:
 *                    type: object
 *                    properties:
 *                      fieldname:
 *                        type: array
 *                        items:
 *                          type: string
 *                        example: ["Invalid file format", "File too large"]
 *        500:
 *          description: Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: false
 *                  message:
 *                    type: string
 *                    example: "SOMETHING_WRONG"
 */


/**
 * @swagger
 * tags:
 *   name: Currency
 *   description: Currency validation operations
 */

/**
 * @swagger
 * path:
 *  /adminapi/currency:
 *    post:
 *      summary: Add and validate a currency
 *      description: This endpoint validates and processes a new currency entry, including various fields like name, symbol, fees, and deposit types.
 *      tags: 
 *       - Admin Currency
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                coin:
 *                  type: string
 *                symbol:
 *                  type: string
 *                depositType:
 *                  type: string
 *                  enum: [local, coin_payment, binance]
 *                image:
 *                  type: string
 *                  format: binary
 *                commisionfee:
 *                  type: number
 *                  format: float
 *                withdrawFee:
 *                  type: number
 *                  format: float
 *                minimumWithdraw:
 *                  type: number
 *                  format: float
 *                depositStatus:
 *                  type: string
 *                  enum: [On, Off]
 *                withdrawStatus:
 *                  type: string
 *                  enum: [On, Off]
 *                type:
 *                  type: string
 *                  enum: [crypto, token, fiat, preferedcurrency]
 *                decimals:
 *                  type: integer
 *                  minimum: 0
 *                contractAddress:
 *                  type: string
 *                minABI:
 *                  type: string
 *                tokenType:
 *                  type: string
 *                  enum: [erc20, trc20, bep20]
 *                bankName:
 *                  type: string
 *                accountNo:
 *                  type: string
 *                holderName:
 *                  type: string
 *                bankcode:
 *                  type: string
 *                country:
 *                  type: string
 *                upiInputValue:
 *                  type: string
 *      responses:
 *        200:
 *          description: Currency added and validated successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: true
 *                  message:
 *                    type: string
 *                    example: "Currency added successfully"
 *        400:
 *          description: Validation error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errors:
 *                    type: object
 *                    additionalProperties:
 *                      type: string
 *                    example: { "name": "Name field is required", "coin": "Coin field is required" }
 *        500:
 *          description: Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: false
 *                  message:
 *                    type: string
 *                    example: "SOMETHING_WRONG"
 */


/**
 * @swagger
 * /adminapi/currency:
 *   post:
 *     summary: Add a new currency
 *     description: This endpoint allows you to add a new currency to the system.
 *     operationId: addCurrency
 *     tags:
 *       - Admin Currency
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the currency.
 *                 example: Bitcoin
 *               symbol:
 *                 type: string
 *                 description: The symbol of the currency.
 *                 example: BTC
 *               withdrawFee:
 *                 type: number
 *                 description: The fee for withdrawing the currency.
 *                 example: 0.01
 *               minimumWithdraw:
 *                 type: number
 *                 description: The minimum amount required for a withdrawal.
 *                 example: 0.1
 *               type:
 *                 type: string
 *                 description: The type of currency (e.g., crypto, token, fiat).
 *                 example: crypto
 *               depositType:
 *                 type: string
 *                 description: The deposit type for the currency.
 *                 example: coin_payment
 *               depositStatus:
 *                 type: string
 *                 description: The deposit status.
 *                 enum: [On, Off]
 *                 example: On
 *               withdrawStatus:
 *                 type: string
 *                 description: The withdrawal status.
 *                 enum: [On, Off]
 *                 example: On
 *               commisionfee:
 *                 type: number
 *                 description: The commission fee for the currency.
 *                 example: 0.02
 *               decimal:
 *                 type: number
 *                 description: The decimal places for the currency.
 *                 example: 8
 *               coinpaymentsymbol:
 *                 type: string
 *                 description: The coin payment symbol.
 *                 example: BTC
 *               api:
 *                 type: string
 *                 description: The API for local deposits (if applicable).
 *                 example: https://api.coinpayment.net
 *               key:
 *                 type: string
 *                 description: The key for local deposits (if applicable).
 *                 example: "API-KEY-12345"
 *               contractAddress:
 *                 type: string
 *                 description: The contract address for token currencies (if applicable).
 *                 example: "0x123456789abcdef"
 *               minABI:
 *                 type: string
 *                 description: The minimum ABI for token currencies (if applicable).
 *                 example: "Token ABI"
 *               tokenType:
 *                 type: string
 *                 description: The type of token (e.g., ERC20, BEP20).
 *                 example: erc20
 *               bankName:
 *                 type: string
 *                 description: The bank name for fiat currencies (if applicable).
 *                 example: Bank of America
 *               accountNo:
 *                 type: string
 *                 description: The account number for fiat currencies (if applicable).
 *                 example: 1234567890
 *               holderName:
 *                 type: string
 *                 description: The holder's name for fiat currencies (if applicable).
 *                 example: John Doe
 *               bankcode:
 *                 type: string
 *                 description: The bank code (IBAN) for fiat currencies (if applicable).
 *                 example: US123456789
 *               country:
 *                 type: string
 *                 description: The country for fiat currencies (if applicable).
 *                 example: USA
 *     responses:
 *       200:
 *         description: Coin added successfully
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
 *                   example: Coin added successfully
 *       400:
 *         description: Invalid request or coin already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *       500:
 *         description: Something went wrong
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
 *                   example: Something went wrong
 */


/**
 * @swagger
 * /adminapi/currency:
 *   post:
 *     summary: Update an existing currency
 *     description: This endpoint allows you to update an existing currency in the system.
 *     operationId: updateCurrency
 *     tags:
 *       - Admin Currency
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currencyId:
 *                 type: string
 *                 description: The ID of the currency to be updated.
 *                 example: "609c72ef153207001f30de8f"
 *               name:
 *                 type: string
 *                 description: The name of the currency.
 *                 example: "Bitcoin"
 *               coin:
 *                 type: string
 *                 description: The coin symbol of the currency.
 *                 example: "BTC"
 *               symbol:
 *                 type: string
 *                 description: The symbol of the currency.
 *                 example: "BTC"
 *               withdrawFee:
 *                 type: number
 *                 description: The fee for withdrawing the currency.
 *                 example: 0.01
 *               minimumWithdraw:
 *                 type: number
 *                 description: The minimum amount required for a withdrawal.
 *                 example: 0.1
 *               type:
 *                 type: string
 *                 description: The type of currency (e.g., crypto, token, fiat).
 *                 example: "crypto"
 *               depositType:
 *                 type: string
 *                 description: The deposit type for the currency.
 *                 example: "coin_payment"
 *               status:
 *                 type: string
 *                 description: The status of the currency (e.g., active or inactive).
 *                 example: "active"
 *               decimal:
 *                 type: number
 *                 description: The decimal places for the currency.
 *                 example: 8
 *               fundLimit:
 *                 type: number
 *                 description: The fund limit for the currency.
 *                 example: 100000
 *               fundFee:
 *                 type: number
 *                 description: The fee for funds related to the currency.
 *                 example: 0.01
 *               fundInterval:
 *                 type: number
 *                 description: The interval for fund operations.
 *                 example: 24
 *               depositStatus:
 *                 type: string
 *                 description: The deposit status.
 *                 enum: [On, Off]
 *                 example: "On"
 *               withdrawStatus:
 *                 type: string
 *                 description: The withdrawal status.
 *                 enum: [On, Off]
 *                 example: "On"
 *               commisionfee:
 *                 type: number
 *                 description: The commission fee for the currency.
 *                 example: 0.02
 *               coinpaymentsymbol:
 *                 type: string
 *                 description: The coin payment symbol.
 *                 example: "BTC"
 *               api:
 *                 type: string
 *                 description: The API for local deposits (if applicable).
 *                 example: "https://api.coinpayment.net"
 *               key:
 *                 type: string
 *                 description: The key for local deposits (if applicable).
 *                 example: "API-KEY-12345"
 *               contractAddress:
 *                 type: string
 *                 description: The contract address for token currencies (if applicable).
 *                 example: "0x123456789abcdef"
 *               minABI:
 *                 type: string
 *                 description: The minimum ABI for token currencies (if applicable).
 *                 example: "Token ABI"
 *               tokenType:
 *                 type: string
 *                 description: The type of token (e.g., ERC20, BEP20).
 *                 example: "erc20"
 *               bankName:
 *                 type: string
 *                 description: The bank name for fiat currencies (if applicable).
 *                 example: "Bank of America"
 *               accountNo:
 *                 type: string
 *                 description: The account number for fiat currencies (if applicable).
 *                 example: "1234567890"
 *               holderName:
 *                 type: string
 *                 description: The holder's name for fiat currencies (if applicable).
 *                 example: "John Doe"
 *               bankcode:
 *                 type: string
 *                 description: The bank code (IBAN) for fiat currencies (if applicable).
 *                 example: "US123456789"
 *               country:
 *                 type: string
 *                 description: The country for fiat currencies (if applicable).
 *                 example: "USA"
 *     responses:
 *       200:
 *         description: Coin updated successfully
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
 *                   example: "Coin updated successfully"
 *       400:
 *         description: Invalid request or coin already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *       500:
 *         description: Something went wrong
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
 *                   example: "Something went wrong"
 */


  /**
 * @swagger
 * /adminapi/currencies:
 *   get:
 *     summary: Retrieve all active currencies
 *     description: Fetches a list of all active currencies with details like coin, symbol, type, etc.
 *     tags:
 *       - Admin Currency
 *     responses:
 *       200:
 *         description: Successfully fetched currencies
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
 *                   example: FETCH_SUCCESS
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Bitcoin"
 *                       coin:
 *                         type: string
 *                         example: "BTC"
 *                       symbol:
 *                         type: string
 *                         example: "₿"
 *                       type:
 *                         type: string
 *                         example: "token"
 *                       withdrawFee:
 *                         type: number
 *                         example: 0.001
 *                       minimumWithdraw:
 *                         type: number
 *                         example: 10
 *                       image:
 *                         type: string
 *                         example: "http://localhost:5000/images/currencies/bitcoin.png"
 *                       fundFee:
 *                         type: number
 *                         example: 0.0005
 *                       api:
 *                         type: string
 *                         example: "https://api.coinpayments.net"
 *                       key:
 *                         type: string
 *                         example: "abcd1234"
 *       500:
 *         description: Internal Server Error
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
 *                   example: SOMETHING_WRONG
 */

  
  /**
 * @swagger
 * /adminapi/emailTemplate:
 *   get:
 *     summary: Retrieve a list of email templates
 *     description: Fetches a paginated list of email templates with optional filters.
 *     tags:
 *       - Email Template
 *     parameters:
 *       - in: query
 *         name: identifier
 *         description: Filter templates by identifier
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: langCode
 *         description: Filter templates by language code
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         description: Filter templates by status (active, inactive)
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         description: The page number for pagination (default is 1)
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         description: Number of items per page (default is 10)
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved email templates
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
 *                   example: Fetched successfully.
 *                 result:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 10
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           identifier:
 *                             type: string
 *                             example: "template1"
 *                           subject:
 *                             type: string
 *                             example: "Welcome email"
 *                           content:
 *                             type: string
 *                             example: "<html><body>Welcome to our service</body></html>"
 *                           langCode:
 *                             type: string
 *                             example: "en"
 *                           status:
 *                             type: string
 *                             example: "active"
 *       500:
 *         description: Internal server error
 */

  
/**
 * @swagger
 * /adminapi/emailTemplate:
 *   post:
 *     summary: Add a new email template
 *     description: Adds a new email template to the system.
 *     tags:
 *       - Email Template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 example: "template1"
 *               subject:
 *                 type: string
 *                 example: "Welcome Email"
 *               content:
 *                 type: string
 *                 example: "<html><body>Welcome to our service</body></html>"
 *               langCode:
 *                 type: string
 *                 example: "en"
 *     responses:
 *       200:
 *         description: Successfully added new template
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
 *                   example: Template added successfully.
 *       400:
 *         description: Bad request due to validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: object
 *                   properties:
 *                     langCode:
 *                       type: string
 *                       example: "Identifier and Language code already exists"
 *       409:
 *         description: Conflict in adding the template
 */



/**
 * @swagger
 * /adminapi/emailTemplate:
 *   put:
 *     summary: Edit an existing email template
 *     description: Updates an email template by ID.
 *     tags:
 *       - Email Template
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the template to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *                 example: "Updated Welcome Email"
 *               content:
 *                 type: string
 *                 example: "<html><body>Welcome to our updated service</body></html>"
 *     responses:
 *       200:
 *         description: Successfully updated the template
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
 *                   example: Template updated successfully.
 *       400:
 *         description: Bad request due to validation error
 *       409:
 *         description: Conflict in updating the template
 */


/**
 * @swagger
 * tags:
 *   name: Announcements
 *   description: API to manage announcements
 */

/**
 * @swagger
 * /adminapi/anouncement:
 *   post:
 *     tags: 
 *       - Anouncement
 *     summary: Upload announcement image and other data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the announcement
 *               endDateTime:
 *                 type: string
 *                 format: date-time
 *                 description: The end date and time for the announcement
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the announcement
 *     responses:
 *       200:
 *         description: Successfully uploaded announcement
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
 *                   example: Successfully added
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *       500:
 *         description: Internal server error
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
 *                   example: Something went wrong
 */


  /**
 * @swagger
 * /adminapi/announcement:
 *   post:
 *     tags: 
 *       - Anouncement
 *     summary: Add a new announcement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the announcement
 *               endDateTime:
 *                 type: string
 *                 format: date-time
 *                 description: The end date and time for the announcement
 *               image:
 *                 type: string
 *                 description: The image file for the announcement
 *     responses:
 *       200:
 *         description: Successfully added announcement
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
 *                   example: Successfully added
 *       500:
 *         description: Internal server error
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
 *                   example: Something went wrong
 */


/**
 * @swagger
 * /adminapi/announcement:
 *   get:
 *     tags: 
 *       - Anouncement
 *     summary: Get list of announcements with pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: List of announcements with pagination
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
 *                   example: FETCH_SUCCESS
 *                 result:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 100
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           content:
 *                             type: string
 *                           endDateTime:
 *                             type: string
 *                             format: date-time
 *                           image:
 *                             type: string
 *                             description: URL to the image
 *       500:
 *         description: Internal server error
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
 *                   example: Something went wrong
 */


/**
 * @swagger
 * /adminapi/announcement:
 *   delete:
 *     tags: 
 *       - Anouncement
 *     summary: Delete an announcement
 *     description: Deletes an announcement by its ID.
 *     parameters:
 *       - in: query
 *         name: _id
 *         description: The ID of the announcement to delete.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the announcement.
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
 *                   example: "Successfully Deleted"
 *       500:
 *         description: Something went wrong during the deletion process.
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
 *                   example: "Something went wrong"
 */

  
/**
 * @swagger
 * /adminapi/user:
 *   get:
 *     tags: 
 *       - Admin Users
 *     summary: Get a list of users with pagination and filter options.
 *     description: Fetches users from the database with the ability to filter by email, status, and phone number. Pagination is also supported.
 *     parameters:
 *       - in: query
 *         name: page
 *         description: The page number for pagination.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         description: The number of users per page.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: email
 *         description: Filter by user email.
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         description: Filter by user status.
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: phoneNo
 *         description: Filter by phone number.
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of users with pagination and filter.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 messages:
 *                   type: string
 *                   example: "success"
 *                 result:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 100
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: "12345"
 *                           email:
 *                             type: string
 *                             example: "user@example.com"
 *                           phoneNo:
 *                             type: string
 *                             example: "+1234567890"
 *       500:
 *         description: Internal server error.
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
 *                   example: "error on server"
 */



/**
 * @swagger
 * /adminapi/user-update:
 *   put:
 *     tags: 
 *       - Admin Users
 *     summary: Update the status of a user.
 *     description: Switches the user status between 'verified' and 'unverified'.
 *     parameters:
 *       - in: body
 *         name: id
 *         description: The ID of the user whose status is to be updated.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "12345"
 *     responses:
 *       200:
 *         description: Successfully updated user status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "verified user"
 *       400:
 *         description: Failed to update status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed"
 *       500:
 *         description: Something went wrong.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "something went wrong"
 */

  
/**
 * @swagger
 * /adminapi/getUserBalnce:
 *   get:
 *     tags: 
 *       - Admin Users
 *     summary: Get a list of user balances.
 *     description: Fetches user balances from the database based on the provided filter (currencySymbol).
 *     parameters:
 *       - in: query
 *         name: page
 *         description: The page number for pagination.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         description: The number of balances per page.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: currencySymbol
 *         description: Filter by currency symbol.
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of user balances.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 messages:
 *                   type: string
 *                   example: "success"
 *                 result:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 100
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           currencySymbol:
 *                             type: string
 *                             example: "USD"
 *                           spotwallet:
 *                             type: number
 *                             example: 500.0
 *                           derivativeWallet:
 *                             type: number
 *                             example: 200.0
 *       500:
 *         description: Internal server error.
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
 *                   example: "error on server"
 */
  

/**
 * @swagger
 * /adminapi/disable-2fa:
 *   put:
 *     tags: 
 *       - Admin Users
 *     summary: Disable 2FA for a user.
 *     description: Disables 2FA for the user by clearing their 2FA secret.
 *     parameters:
 *       - in: body
 *         name: id
 *         description: The ID of the user for whom 2FA should be disabled.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "12345"
 *     responses:
 *       200:
 *         description: 2FA disabled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "2FA Disabled"
 *       400:
 *         description: Failed to disable 2FA.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Disable Failed"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "something went wrong"
 */


/**
 * @swagger
 * /adminapi/security:
 *   get:
 *     summary: Get 2FA code for the admin
 *     description: Generates a 2FA code for the admin based on their saved data
 *     tags: 
 *       - 2fa
 *     responses:
 *       200:
 *         description: Successfully retrieved 2FA code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: object
 *                   description: The generated 2FA code data
 *       500:
 *         description: Something went wrong
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
 *                   example: SOMETHING_WRONG
 */

/**
 * @swagger
 * /adminapi/update2FA:
 *   post:
 *     summary: Update 2FA settings for the admin
 *     description: Enables 2FA for the admin by validating the provided secret and code.
 *     tags: 
 *       - 2fa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               secret:
 *                 type: string
 *                 description: The 2FA secret key
 *               code:
 *                 type: string
 *                 description: The verification code generated by the 2FA app
 *               uri:
 *                 type: string
 *                 description: The URI to generate the 2FA secret
 *               Password:
 *                 type: string
 *                 description: The admin password to verify
 *     responses:
 *       200:
 *         description: Successfully enabled 2FA
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
 *                   example: 2FA Enable Successfully
 *                 result:
 *                   type: object
 *                   description: The updated user data with 2FA settings
 *       400:
 *         description: Invalid code or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: Invalid Code
 *       500:
 *         description: Something went wrong
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
 *                   example: SOMETHING_WRONG
 */

/**
 * @swagger
 * /adminapi/disabled2FA:
 *   post:
 *     summary: Disable 2FA for the admin
 *     description: Disables 2FA for the admin after verifying the code and password.
 *     tags: 
 *       - 2fa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               secret:
 *                 type: string
 *                 description: The 2FA secret key
 *               code:
 *                 type: string
 *                 description: The verification code generated by the 2FA app
 *               Password:
 *                 type: string
 *                 description: The admin password to verify
 *               CheckValue:
 *                 type: boolean
 *                 description: Whether to select the backup code
 *     responses:
 *       200:
 *         description: Successfully disabled 2FA
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
 *                   example: 2FA Disabled Successfully
 *                 result:
 *                   type: object
 *                   description: The updated user data after disabling 2FA
 *       400:
 *         description: Invalid code, password, or missing backup code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: Invalid Code
 *       500:
 *         description: Something went wrong
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
 *                   example: SOMETHING_WRONG
 */


/**
 * @swagger
 * /adminapi/userKyc:
 *   get:
 *     summary: Get a list of all user KYC data with pagination.
 *     tags: 
 *       - Admin Kyc
 *     parameters:
 *       - in: query
 *         name: limit
 *         description: Number of records to retrieve
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: page
 *         description: Page number to retrieve (for pagination)
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: A list of user KYC data along with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                           idProof:
 *                             type: object
 *                             properties:
 *                               status:
 *                                 type: string
 *                                 example: 'approved'
 *                           addressProof:
 *                             type: object
 *                             properties:
 *                               status:
 *                                 type: string
 *                                 example: 'rejected'
 *                           email:
 *                             type: string
 *                             example: 'user@example.com'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /adminapi/userKyc:
 *   post:
 *     summary: Approve KYC documents for a user.
 *     tags: 
 *       - Admin Kyc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The user ID for the KYC document approval
 *               formType:
 *                 type: string
 *                 enum:
 *                   - idProof
 *                   - addressProof
 *                 description: The type of KYC form (either 'idProof' or 'addressProof')
 *               reason:
 *                 type: string
 *                 description: The reason for rejection if applicable
 *     responses:
 *       200:
 *         description: KYC document approved successfully
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
 *                   example: 'KYC document approved successfully'
 *       400:
 *         description: Invalid request or KYC document already processed
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /adminapi/userKyc:
 *   post:
 *     summary: Reject KYC documents for a user.
 *     tags: 
 *       - Admin Kyc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The user ID for the KYC document rejection
 *               formType:
 *                 type: string
 *                 enum:
 *                   - idProof
 *                   - addressProof
 *                 description: The type of KYC form (either 'idProof' or 'addressProof')
 *               reason:
 *                 type: string
 *                 description: The reason for rejection
 *     responses:
 *       200:
 *         description: KYC document rejected successfully
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
 *                   example: 'KYC document rejected successfully'
 *       400:
 *         description: Invalid request or KYC document already processed
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /changeUsrType/{userId}:
 *   put:
 *     summary: Change the user type based on the user ID.
 *     tags: 
 *       - Admin user type
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user whose type will be changed
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User type updated successfully
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
 *                   example: 'Verification type updated successfully'
 *       400:
 *         description: User not found or invalid user type
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /adminapi/kycList:
 *   post:
 *     summary: Get the KYC documents for a specific user.
 *     tags: 
 *       - Admin Kyc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The user ID for which KYC details are retrieved
 *     responses:
 *       200:
 *         description: KYC details for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /adminapi/depositList:
 *   get:
 *     description: Get a list of deposit transactions
 *     tags: 
 *       - Admin
 *     parameters:
 *       - in: query
 *         name: export
 *         description: Type of export (csv, pdf)
 *         schema:
 *           type: string
 *           enum: [csv, pdf]
 *     responses:
 *       200:
 *         description: A list of deposit transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: '12345'
 *                           coin:
 *                             type: string
 *                             example: 'BTC'
 *                           toAddress:
 *                             type: string
 *                             example: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
 *                           amount:
 *                             type: number
 *                             example: 0.5
 *       500:
 *         description: Error on server
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
 *                   example: 'Error on server'
 */


/**
 * @swagger
 * /adminapi/withdrawList:
 *   get:
 *     description: Get a list of withdraw transactions
 *     tags: 
 *       - Anouncement
 *     parameters:
 *       - in: query
 *         name: export
 *         description: Type of export (csv, pdf)
 *         schema:
 *           type: string
 *           enum: [csv, pdf]
 *     responses:
 *       200:
 *         description: A list of withdraw transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: '12345'
 *                           coin:
 *                             type: string
 *                             example: 'ETH'
 *                           toAddress:
 *                             type: string
 *                             example: '0xAddressHere'
 *                           amount:
 *                             type: number
 *                             example: 2
 *       500:
 *         description: Error on server
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
 *                   example: 'Error on server'
 */


/**
 * @swagger
 * /adminapi/coinWithdraw/approve/:transactionId:
 *   put:
 *     tags:
 *       - Coin Withdraw
 *     summary: Approve a coin withdrawal
 *     description: Approves a coin withdrawal request
 *     parameters:
 *       - name: transactionId
 *         in: path
 *         required: true
 *         description: ID of the transaction to approve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Withdraw successfully completed
 *       400:
 *         description: Invalid Token or something went wrong
 *       500:
 *         description: Error on server
 */



/**
 * @swagger
 * /adminapi/coinWithdraw/reject/:transactionId:
 *   put:
 *     tags:
 *       - Coin Withdraw
 *     summary: Reject a coin withdrawal
 *     description: Rejects a coin withdrawal request
 *     parameters:
 *       - name: transactionId
 *         in: path
 *         required: true
 *         description: ID of the transaction to reject
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Withdraw successfully rejected
 *       400:
 *         description: Invalid Token or something went wrong
 *       500:
 *         description: Error on server
 */


/**
 * @swagger
 * /adminapi/fiatWithdraw/reject/:transactionId:
 *   put:
 *     summary: Reject a fiat withdrawal
 *     description: Rejects a fiat withdrawal transaction and updates the user's balance.
 *     tags: 
 *       - Anouncement
 *     parameters:
 *       - name: transactionId
 *         in: path
 *         description: The transaction ID to reject
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Withdraw successfully rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid Token or error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Error on server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */


/**
 * @swagger
 * /adminapi/fiatDeposit/approve:
 *   post:
 *     summary: Approve a fiat deposit
 *     description: Approves a fiat deposit transaction and updates the user's wallet balance.
 *     tags: 
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Amount added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid Token or amount mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Error on server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */


/**
 * @swagger
 * /adminapi/getSiteSetting:
 *   get:
 *     summary: Get site settings
 *     tags: 
 *       - Site Settings
 *     responses:
 *       200:
 *         description: Successfully fetched site settings
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
 *                   example: Fetch success
 *                 result:
 *                   type: object
 *                   properties:
 *                     marketTrend:
 *                       type: string
 *                       example: 'up'
 *                     userDashboard:
 *                       type: string
 *                       example: 'overview'
 *                     facebookLink:
 *                       type: string
 *                       example: 'https://facebook.com'
 *                     twitterUrl:
 *                       type: string
 *                       example: 'https://twitter.com'
 *                     linkedinLink:
 *                       type: string
 *                       example: 'https://linkedin.com'
 *                     telegramlink:
 *                       type: string
 *                       example: 'https://t.me'
 *                     
 *       500:
 *         description: Something went wrong
 */

  
  /**
   * @swagger
   * /adminapi/updateSiteSetting:
   *   post:
   *     summary: Update site settings
   *     tags: 
   *       - Site Settings
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               marketTrend:
   *                 type: string
   *                 example: 'down'
   *     responses:
   *       200:
   *         description: Successfully updated site settings
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
   *                   example: Fetch success
   *                 result:
   *                   type: object
   *                   properties:
   *                     marketTrend:
   *                       type: string
   *                       example: 'down'
   *       500:
   *         description: Something went wrong
   */

  
  /**
   * @swagger
   * /adminapi/updateSiteDetails:
   *   post:
   *     summary: Update site details (Facebook, Twitter, etc.)
   *     tags: 
   *       - Site Settings
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               fbLink:
   *                 type: string
   *                 example: 'https://facebook.com'
   *               twiterLink:
   *                 type: string
   *                 example: 'https://twitter.com'
   *               siteName:
   *                 type: string
   *                 example: 'My Site'
   *               address:
   *                 type: string
   *                 example: '123 Street'
   *               address1:
   *                 type: string
   *                 example: 'Suite 100'
   *               contactNo:
   *                 type: string
   *                 example: '+1234567890'
   *               supportMail:
   *                 type: string
   *                 example: 'support@mysite.com'
   *     responses:
   *       200:
   *         description: Successfully updated site details
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
   *                   example: "updated success"
   *       500:
   *         description: Something went wrong
   */


  /**
   * @swagger
   * /adminapi/updateUsrDash:
   *   post:
   *     summary: Update user dashboard settings
   *     tags: 
   *       - Site Settings
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               currencyList:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ['USD', 'EUR']
   *     responses:
   *       200:
   *         description: Successfully updated user dashboard
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
   *                   example: "Fetch success"
   *       400:
   *         description: Currency and Color coder is required
   *       500:
   *         description: Something went wrong
   */

  
/**
 * @swagger
 * /adminapi/updateSocialMedia:
 *   post:
 *     summary: Update social media links
 *     description: Updates the social media links on the site settings.
 *     tags: 
 *       - Site Settings
 *     parameters:
 *       - in: body
 *         name: fbLink
 *         description: Facebook link
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: twitterLink
 *         description: Twitter link
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: linkedInLink
 *         description: LinkedIn link
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: telegramLink
 *         description: Telegram link
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: blogLink
 *         description: Blog link
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: youtubeLink
 *         description: YouTube link
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Social media links updated successfully.
 *       500:
 *         description: Something went wrong.
 */

/**
 * @swagger
 * /adminapi/updateFaqTrend:
 *   post:
 *     summary: Update FAQ trend
 *     description: Updates the FAQ trend data in the site settings.
 *     tags: 
 *       - Admin
 *     parameters:
 *       - in: body
 *         name: faqTrend
 *         description: The new FAQ trend.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ trend updated successfully.
 *       500:
 *         description: Something went wrong.
 */

/**
 * @swagger
 * /adminapi/updatemailintegrate:
 *   post:
 *     summary: Update mail integration
 *     description: Integrates or updates the mail settings based on the configuration type.
 *     tags: 
 *       - Site Settings
 *     parameters:
 *       - in: body
 *         name: type
 *         description: Type of mail service (e.g., sendinBlue or nodemailer)
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: fromMail
 *         description: From email address for sending emails.
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: api
 *         description: API key for the service.
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mail integration updated successfully.
 *       500:
 *         description: Something went wrong.
 */

/**
 * @swagger
 * /adminapi/getemailintegrate:
 *   get:
 *     summary: Get mail integration settings
 *     description: Retrieves the current mail integration settings.
 *     tags: 
 *       - Site Settings
 *     responses:
 *       200:
 *         description: Successfully retrieved mail integration settings.
 *       500:
 *         description: Something went wrong.
 */

/**
 * @swagger
 * /adminapi/updateLimit:
 *   post:
 *     summary: Update API limit
 *     description: Updates the API limit for the site settings.
 *     tags: 
 *       - Site Settings
 *     parameters:
 *       - in: body
 *         name: ApiLimit
 *         description: The new API limit.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: API limit updated successfully.
 *       500:
 *         description: Something went wrong.
 */

/**
 * @swagger
 * /adminapi/getApiLimit:
 *   get:
 *     summary: Get API limit
 *     description: Retrieves the current API limit.
 *     tags: 
 *       - Api Limit
 *     responses:
 *       200:
 *         description: Successfully retrieved the API limit.
 *       500:
 *         description: Something went wrong.
 */


/**
 * @swagger
 * /adminapi/fetch-profit:
 *   get:
 *     summary: Retrieve a list of Admin profits
 *     description: Fetch Admin profits with optional pagination, filters, and export formats (CSV, XLS, PDF)
 *     tags: 
 *       - Admin
 *     parameters:
 *       - in: query
 *         name: export
 *         schema:
 *           type: string
 *           enum: [csv, xls, pdf]
 *         description: The export format (optional)
 *       - in: query
 *         name: coin
 *         schema:
 *           type: string
 *         description: The coin filter (optional)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: The type filter (optional)
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: The userId filter (optional)
 *     responses:
 *       200:
 *         description: Successfully retrieved Admin profit data
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
 *                   example: FETCH_SUCCESS
 *                 result:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 100
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           createdAt:
 *                             type: string
 *                             example: "2024-11-18T10:00:00Z"
 *                           userId:
 *                             type: string
 *                             example: "12345"
 *                           coin:
 *                             type: string
 *                             example: "BTC"
 *                           type:
 *                             type: string
 *                             example: "deposit"
 *                           fee:
 *                             type: number
 *                             example: 0.01
 *       500:
 *         description: Internal server error
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
 *                   example: Something went wrong
 */


/**
 * @swagger
 * /adminapi/cms:
 *   get:
 *     summary: Get CMS list
 *     description: Fetch the list of CMS content with identifier, title, and status.
 *     tags: 
 *       - Admin
 *     responses:
 *       200:
 *         description: Fetch successful
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
 *                   example: Fetch successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       identifier:
 *                         type: string
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       image:
 *                         type: string
 *                       status:
 *                         type: string
 *       500:
 *         description: Something went wrong
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
 *                   example: Something went wrong
 */


/**
 * @swagger
 * /adminapi/cms:
 *   put:
 *     summary: Update CMS content
 *     description: Update CMS content, including title, content, and image.
 *     tags: 
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               identifier:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: CMS content updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cms updated successfully
 *       400:
 *         description: No CMS found with the given ID
 *       500:
 *         description: Error updating CMS
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Page name or content is required
 */


/**
 * @swagger
 * /adminapi/faqCategory:
 *   get:
 *     summary: Get a list of FAQ categories
 *     tags: 
 *       - Admin
 *     responses:
 *       200:
 *         description: Successfully fetched FAQ categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       status:
 *                         type: string
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /adminapi/faqCategory:
 *   post:
 *     summary: Add a new FAQ category
 *     tags: 
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully added FAQ category
 *       400:
 *         description: Category name already exists
 *       500:
 *         description: Category name is required
 */

/**
 * @swagger
 * /adminapi/faqCategory/{id}:
 *   put:
 *     summary: Update an existing FAQ category
 *     tags: 
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The FAQ category ID to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated FAQ category
 *       400:
 *         description: Category name already exists
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /adminapi/faqCategory/{id}:
 *   delete:
 *     summary: Delete an FAQ category
 *     tags: 
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The FAQ category ID to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted FAQ category
 *       400:
 *         description: No record found
 *       500:
 *         description: Something went wrong
 */


/**
 * @swagger
 * /aminapi/faq:
 *   get:
 *     summary: Get list of FAQs with pagination and filtering
 *     tags:
 *       - FAQ
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of items per page
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         required: false
 *         description: Search term to filter FAQs by question or category name
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched list of FAQs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           categoryId:
 *                             type: string
 *                           categoryName:
 *                             type: string
 *                           question:
 *                             type: string
 *                           answer:
 *                             type: string
 *                           status:
 *                             type: string
 *       500:
 *         description: Something went wrong
 */


/**
 * @swagger
 * /adminapi/faq:
 *   post:
 *     summary: Add a new FAQ category
 *     tags:
 *       - FAQ Category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the FAQ category
 *     responses:
 *       200:
 *         description: Successfully added FAQ category
 *       400:
 *         description: Category name already exists
 *       500:
 *         description: Error adding category
 */


/**
 * @swagger
 * /adminapi/faq:
 *   put:
 *     summary: Update an existing FAQ
 *     tags:
 *       - FAQ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the FAQ to update
 *               categoryId:
 *                 type: string
 *                 description: The ID of the category the FAQ belongs to
 *               question:
 *                 type: string
 *                 description: The question for the FAQ
 *               answer:
 *                 type: string
 *                 description: The answer for the FAQ
 *               status:
 *                 type: string
 *                 description: The status of the FAQ (e.g., 'active', 'inactive')
 *     responses:
 *       200:
 *         description: Successfully updated FAQ
 *       400:
 *         description: There is no category or missing required fields
 *       500:
 *         description: Error updating FAQ
 */


/**
 * @swagger
 * /adminapi/faq:
 *   delete:
 *     summary: Delete an FAQ by ID
 *     tags:
 *       - FAQ
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the FAQ to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted FAQ
 *       400:
 *         description: FAQ not found
 *       500:
 *         description: Error deleting FAQ
 */


/**
 * @swagger
 * /adminapi/getFaqDropdown:
 *   get:
 *     summary: Get all active FAQs for the dropdown
 *     description: Fetches a list of FAQs that are active and displays only the question and id for use in a dropdown.
 *     tags: 
 *       - Admin
 *     responses:
 *       200:
 *         description: Successfully fetched FAQs
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
 *                   example: Fetched successfully.
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60b3f2a01f2b5f001b2f5e10"
 *                       question:
 *                         type: string
 *                         example: "What is Node.js?"
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /adminapi/userPassBookHistory:
 *   get:
 *     summary: Get user passbook history
 *     description: Fetch the passbook history of a user with filtering and pagination
 *     tags:
 *       - Passbook
 *     parameters:
 *       - in: query
 *         name: userId
 *         description: The unique user ID whose passbook history is to be fetched
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: coin
 *         description: Filter by coin type
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         description: Filter by type of transaction (e.g., deposit, withdraw)
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         description: Filter by transaction category (e.g., rewards, purchases)
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         description: Number of records to return per page (pagination)
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: skip
 *         description: Number of records to skip for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Successfully fetched user passbook history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates success or failure of the operation
 *                   example: true
 *                 result:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       description: The total number of records that match the filter
 *                       example: 100
 *                     data:
 *                       type: array
 *                       description: List of passbook history records
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Passbook record ID
 *                           coin:
 *                             type: string
 *                             description: The coin used in the transaction
 *                           type:
 *                             type: string
 *                             description: Type of the transaction
 *                           category:
 *                             type: string
 *                             description: Category of the transaction
 *                           amount:
 *                             type: number
 *                             description: Amount of the transaction
 *                             example: 100
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             description: The date and time when the transaction was recorded
 *                             example: "2024-11-18T12:00:00Z"
 *       400:
 *         description: Invalid request, userId is required or invalid query parameters
 *       500:
 *         description: Internal server error
 */



/**
 * @swagger
 * /adminpi/p2pPair:
 *   get:
 *     summary: "Retrieve a list of coin pairs"
 *     description: "Fetches the list of available pairs, with options for exporting to CSV, PDF, or regular JSON."
 *     tags: 
 *       - Admin P2P
 *     parameters:
 *       - in: query
 *         name: export
 *         description: "Export type (csv, xls, pdf)"
 *         required: false
 *         schema:
 *           type: string
 *           enum: [csv, xls, pdf]
 *       - in: query
 *         name: firstCoin
 *         description: "Filter by the first coin"
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: secondCoin
 *         description: "Filter by the second coin"
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         description: "Filter by pair status"
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Successfully fetched pairs"
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
 *                   example: "success"
 *                 result:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 50
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           firstCoin:
 *                             type: string
 *                             example: "BTC"
 *                           secondCoin:
 *                             type: string
 *                             example: "USDT"
 *                           feePct:
 *                             type: number
 *                             example: 0.2
 *                           status:
 *                             type: string
 *                             example: "active"
 */

/**
 * @swagger
 * /adminapi/p2pPair:
 *   post:
 *     summary: "Add a new coin pair"
 *     description: "Creates a new coin pair with the provided currencies, fee percentage, and other data."
 *     tags: 
 *       - Admin P2P
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstCoinId:
 *                 type: string
 *                 example: "60d5f97b5c2c3f07b8d8dbf3"
 *               secondCoinId:
 *                 type: string
 *                 example: "60d5f97b5c2c3f07b8d8dbf4"
 *               feePct:
 *                 type: number
 *                 example: 0.2
 *               status:
 *                 type: string
 *                 example: "active"
 *               payment:
 *                 type: string
 *                 example: '{"paymentMethod": "bank"}'
 *     responses:
 *       200:
 *         description: "Coin pair successfully added"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Pair added successfully"
 *       400:
 *         description: "Invalid input or pair already exists"
 */


/**
 * @swagger
 * /adminapi/p2pPair:
 *   put:
 *     summary: "Edit an existing coin pair"
 *     description: "Updates the details of an existing coin pair based on the provided pair ID."
 *     tags: 
 *       - Admin P2P
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pairId:
 *                 type: string
 *                 example: "60d5f97b5c2c3f07b8d8dbf5"
 *               firstCoinId:
 *                 type: string
 *                 example: "60d5f97b5c2c3f07b8d8dbf3"
 *               secondCoinId:
 *                 type: string
 *                 example: "60d5f97b5c2c3f07b8d8dbf4"
 *               feePct:
 *                 type: number
 *                 example: 0.3
 *               status:
 *                 type: string
 *                 example: "inactive"
 *     responses:
 *       200:
 *         description: "Coin pair successfully updated"
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
 *                   example: "Pair updated successfully"
 *       400:
 *         description: "Invalid input"
 */


/**
 * @swagger
 * /adminapi/p2p/orderReport:
 *   get:
 *     summary: Generate order reports
 *     description: Fetch order reports in CSV, XLS, or default format.
 *     tags: 
 *       - Admin P2P
 *     parameters:
 *       - in: query
 *         name: export
 *         schema:
 *           type: string
 *           enum: [csv, xls, pdf]
 *         description: Format of the report to export.
 *     responses:
 *       200:
 *         description: Successfully fetched the report.
 *       500:
 *         description: Internal server error.
 */

  
  /**
   * @swagger
   * /adminapi/p2p/getOrderReport/:orderId:
   *   get:
   *     summary: Get order details
   *     description: Fetch detailed information about a specific order.
   *     tags: 
   *       - Admin P2P
   *     parameters:
   *       - in: path
   *         name: orderId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the order to retrieve.
   *     responses:
   *       200:
   *         description: Successfully fetched order details.
   *       404:
   *         description: Order not found.
   *       500:
   *         description: Internal server error.
   */

  
/**
 * @swagger
 * /adminapi/p2p/adminConversation:
 *   post:
 *     summary: Send a message as an admin in a P2P order chat.
 *     tags: 
 *       - Admin P2P
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: The ID of the order.
 *               message:
 *                 type: string
 *                 description: The message to be sent.
 *     responses:
 *       200:
 *         description: Message sent successfully.
 *       400:
 *         description: Invalid input or order state.
 */

/**
 * @swagger
 * /adminapi/p2p/disputeResolve:
 *   post:
 *     summary: Resolve a dispute for a P2P order.
 *     tags: 
 *       - Admin P2P
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: The ID of the order.
 *               side:
 *                 type: string
 *                 enum: [buy, sell]
 *                 description: The side to resolve the dispute for.
 *     responses:
 *       200:
 *         description: Dispute resolved successfully.
 *       400:
 *         description: Invalid input or order state.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /adminapi/p2p/disputeList:
 *   get:
 *     summary: Fetch the list of disputes.
 *     tags: 
 *       - Admin P2P
 *     responses:
 *       200:
 *         description: List of disputes fetched successfully.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /adminapi/priceCNV:
 *   get:
 *     summary: Retrieve a paginated list of price conversions
 *     tags: 
 *       - Price Conversion
 *     parameters:
 *       - in: query
 *         name: baseSymbol
 *         schema:
 *           type: string
 *         description: Base symbol to filter results
 *       - in: query
 *         name: convertSymbol
 *         schema:
 *           type: string
 *         description: Convert symbol to filter results
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
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successful retrieval of price conversions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messages:
 *                   type: string
 *                 result:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           baseSymbol:
 *                             type: string
 *                           convertSymbol:
 *                             type: string
 *                           convertPrice:
 *                             type: number
 *                           fetchstatus:
 *                             type: string
 *   put:
 *     summary: Update a price conversion entry
 *     tags: 
 *       - Price Conversion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priceCNVId:
 *                 type: string
 *               convertPrice:
 *                 type: number
 *               fetchstatus:
 *                 type: string
 *     responses:
 *       200:
 *         description: Price updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * tags:
 *   name: SupportCategory
 *   description: API endpoints to manage support categories
 */

/**
 * @swagger
 * /adminapi/supportCategory:
 *   get:
 *     summary: Retrieve a list of support categories
 *     tags: 
 *       - SupportCategory
 *     parameters:
 *       - in: query
 *         name: categoryName
 *         schema:
 *           type: string
 *         description: Filter by category name
 *     responses:
 *       200:
 *         description: A list of support categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 result:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           categoryName:
 *                             type: string
 *                           status:
 *                             type: string
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /adminapi/supportCategory:
 *   post:
 *     summary: Add a new support category
 *     tags: 
 *       - SupportCategory
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *                 description: The name of the support category
 *                 example: General Support
 *     responses:
 *       200:
 *         description: Support category added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 result:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 errors:
 *                   type: object
 *                   properties:
 *                     categoryName:
 *                       type: string
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /adminapi/supportCategory:
 *   put:
 *     summary: Edit an existing support category
 *     tags: 
 *       - SupportCategory
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *                 description: The ID of the category to edit
 *               categoryName:
 *                 type: string
 *                 description: The new name of the support category
 *               status:
 *                 type: string
 *                 description: The updated status of the support category
 *     responses:
 *       200:
 *         description: Support category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 result:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 errors:
 *                   type: object
 *                   properties:
 *                     categoryName:
 *                       type: string
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         tickerId:
 *           type: string
 *           description: The unique ticket ID
 *         categoryName:
 *           type: string
 *           description: The category of the ticket
 *         status:
 *           type: string
 *           description: The status of the ticket (e.g., open, closed)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the ticket was created
 * 
 * /adminapi/ticketList:
 *   get:
 *     summary: Get a list of tickets
 *     description: Retrieve a list of support tickets, optionally exported as CSV or PDF.
 *     tags: 
 *       - SupportTicket
 *     parameters:
 *       - in: query
 *         name: export
 *         schema:
 *           type: string
 *           enum: [csv, pdf]
 *           description: Export format for the tickets
 *     responses:
 *       200:
 *         description: A list of tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /adminapi/ticketMessage:
 *   get:
 *     summary: Get ticket messages
 *     description: Retrieve messages for a specific ticket.
 *     tags: 
 *       - SupportTicket
 *     parameters:
 *       - in: query
 *         name: ticketId
 *         schema:
 *           type: string
 *           description: The unique ID of the ticket
 *       - in: query
 *         name: adminId
 *         schema:
 *           type: string
 *           description: The ID of the admin managing the ticket
 *     responses:
 *       200:
 *         description: Ticket messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 result:
 *                   type: object
 *                   properties:
 *                     tickerId:
 *                       type: string
 *                     reply:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           senderId:
 *                             type: string
 *                           message:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: No data found
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /support/ticketMessage:
 *   post:
 *     summary: Reply to a support ticket
 *     description: Adds a reply to an existing support ticket and sends a notification to the user.
 *     tags: 
 *       - SupportTicket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticketId
 *               - receiverId
 *               - message
 *             properties:
 *               ticketId:
 *                 type: string
 *                 description: The unique identifier of the support ticket.
 *               receiverId:
 *                 type: string
 *                 description: The ID of the user receiving the reply.
 *               message:
 *                 type: string
 *                 description: The reply message.
 *     responses:
 *       200:
 *         description: Successfully replied to the message.
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
 *                   example: Successfully replied to the message
 *                 result:
 *                   type: object
 *                   description: Updated ticket data.
 *       400:
 *         description: No matching ticket found.
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
 *                   example: No record
 *       500:
 *         description: Internal server error.
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
 *                   example: Something went wrong
 */



/**
 * @swagger
 * /adminapi/subscriber-all:
 *   get:
 *     summary: Get all newsletter subscribers
 *     description: Fetches all the email addresses of newsletter subscribers.
 *     tags: 
 *       - Newsletter
 *     responses:
 *       200:
 *         description: Successfully fetched subscriber data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: FETCH
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: string
 *                         example: user@example.com
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error on server
 */

/**
 * @swagger
 * /adminapi/subscriber/sendNews:
 *   post:
 *     summary: Send a newsletter to subscribers
 *     description: Sends a newsletter message to a list of subscribers based on their IDs.
 *     tags: 
 *       - Newsletter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscribedId
 *               - message
 *             properties:
 *               subscribedId:
 *                 type: array
 *                 description: Array of subscriber IDs to whom the newsletter will be sent.
 *                 items:
 *                   type: string
 *                   example: 637a2f71f7b11b001c123456
 *               message:
 *                 type: string
 *                 description: The newsletter content to send to subscribers.
 *                 example: "<p>Welcome to our newsletter!</p>"
 *     responses:
 *       200:
 *         description: Successfully sent newsletter emails.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Sent newsletter mails successfully. Refreshing data
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error on server
 */


/**
 * @swagger
 * /adminapi/getPairDropdown:
 *   get:
 *     summary: Get active spot pairs for a dropdown
 *     description: Fetches a list of active spot pairs, including their currency symbols and mark price.
 *     tags: 
 *       - Pair
 *     responses:
 *       200:
 *         description: Successfully fetched spot pairs.
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
 *                   example: Fetch success
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       firstCurrencySymbol:
 *                         type: string
 *                         example: BTC
 *                       secondCurrencySymbol:
 *                         type: string
 *                         example: USDT
 *                       markPrice:
 *                         type: number
 *                         example: 29500.23
 *       400:
 *         description: No records found.
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
 *                   example: No record
 *       500:
 *         description: Server error.
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
 *                   example: Something went wrong
 */


/**
 * @swagger
 * /adminapi/get-position:
 *   get:
 *     summary: Get closed positions
 *     description: Fetches a list of closed positions from the database.
 *     tags: 
 *       - position
 *     responses:
 *       200:
 *         description: Successfully fetched closed positions.
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
 *                   example: Fetch success
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 64e6a98d5f0c1b00123abcd5
 *                       position:
 *                         type: string
 *                         example: BTC/USDT
 *                       status:
 *                         type: string
 *                         example: closed
 *       500:
 *         description: Server error.
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
 *                   example: Something went wrong
 */


