/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user using email or mobile phone number. For mobile registration, OTP verification is required.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               formType:
 *                 type: string
 *                 enum: [email, mobile]
 *                 description: Registration method. 'email' or 'mobile'
 *                 example: email
 *               email:
 *                 type: string
 *                 description: User's email address (required if formType is 'email')
 *                 example: user@example.com
 *               phoneCode:
 *                 type: string
 *                 description: Country code for phone number (required if formType is 'mobile')
 *                 example: 1
 *               phoneNo:
 *                 type: string
 *                 description: Phone number (required if formType is 'mobile')
 *                 example: 5551234567
 *               password:
 *                 type: string
 *                 description: Password for the account
 *                 example: password123
 *               otp:
 *                 type: string
 *                 description: OTP sent to mobile (required if formType is 'mobile')
 *                 example: 123456
 *               referenceCode:
 *                 type: string
 *                 description: Referral code (optional)
 *                 example: REF12345
 *             required:
 *               - formType
 *               - password
 *     responses:
 *       200:
 *         description: User registered successfully
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
 *                   example: "Your account has been registered. Please check your email and enable your account."
 *       400:
 *         description: Invalid request or validation errors
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
 *                   description: Detailed error messages for invalid fields
 *                   example: { email: "Email already exists" }
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
 *                   example: "Something went wrong"
 */


 /**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Log in a user with email or mobile.
 *     description: Authenticates a user by email or mobile, and returns a JWT token upon successful login.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               formType:
 *                 type: string
 *                 description: Login form type, either 'email' or 'mobile'.
 *                 example: "email"
 *               email:
 *                 type: string
 *                 description: User's email address.
 *                 example: "user@example.com"
 *               phoneCode:
 *                 type: string
 *                 description: User's phone code for mobile login.
 *                 example: "91"
 *               phoneNo:
 *                 type: string
 *                 description: User's phone number for mobile login.
 *                 example: "1234567890"
 *               password:
 *                 type: string
 *                 description: User's password.
 *                 example: "password123"
 *               twoFACode:
 *                 type: string
 *                 description: Two-factor authentication code, if applicable.
 *                 example: "123456"
 *               otp:
 *                 type: string
 *                 description: OTP code, required if IP restriction is enabled.
 *                 example: "1234"
 *               loginHistory:
 *                 type: object
 *                 properties:
 *                   ipaddress:
 *                     type: string
 *                     description: IP address of the user.
 *                     example: "192.168.1.1"
 *                   broswername:
 *                     type: string
 *                     description: Browser name used during login.
 *                     example: "Chrome"
 *                   countryName:
 *                     type: string
 *                     description: Country name of the user.
 *                     example: "United States"
 *     responses:
 *       200:
 *         description: Successful login
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
 *                   example: "SUCCESS"
 *                 message:
 *                   type: string
 *                   example: "Login successfully"
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated user.
 *                 result:
 *                   type: object
 *                   description: User profile details.
 *                 userSetting:
 *                   type: object
 *                   description: User settings such as theme and afterLogin actions.
 *       400:
 *         description: Invalid input or failed authentication
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
 *                   description: Detailed errors
 *                 message:
 *                   type: string
 *                   example: "Invalid OTP or expired"
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
 * /api/resend-otp:
 *   post:
 *     summary: Resend OTP to the user's email.
 *     description: Generates a new OTP, updates it in the user's record, and sends it via email.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address to which the OTP will be resent.
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: OTP successfully sent to the email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: string
 *                   example: "otpsent"
 *                 message:
 *                   type: string
 *                   example: "OTP sent to your mail id"
 *       400:
 *         description: Invalid mobile number (for SMS, if applicable)
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
 *                     phoneNo:
 *                       type: string
 *                       example: "Invalid mobile number"
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
 * /api/userProfile:
 *   get:
 *     summary: Retrieve the user's profile information.
 *     description: Fetches the profile details of the currently authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []   # JWT or Bearer token authorization if required
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile.
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
 *                   description: User profile details.
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     age:
 *                       type: integer
 *                       example: 30
 *                     # Add other relevant fields returned by userProfileDetail here
 *       500:
 *         description: Server error or user not found.
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
 * /api/userProfile:
 *   put:
 *     summary: Edit the authenticated user's profile.
 *     description: Allows an authenticated user to update their profile details.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []   # JWT or Bearer token authorization if required
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               blockNo:
 *                 type: string
 *                 example: "123"
 *               address:
 *                 type: string
 *                 example: "123 Main St"
 *               country:
 *                 type: string
 *                 example: "USA"
 *               state:
 *                 type: string
 *                 example: "California"
 *               city:
 *                 type: string
 *                 example: "Los Angeles"
 *               postalCode:
 *                 type: string
 *                 example: "90001"
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Upload a profile image.
 *     responses:
 *       200:
 *         description: Successfully edited profile.
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
 *                   example: "PROFILE_EDIT_SUCCESS"
 *                 result:
 *                   type: object
 *                   description: Updated user profile details.
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     # Add additional fields returned by userProfileDetail as needed.
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
 *                   example: "SOMETHING_WRONG"
 */


/**
 * @swagger
 * /updateBankDetail:
 *   put:
 *     summary: Update or add a bank detail for a user
 *     tags:
 *       - Bank Details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bankId:
 *                 type: string
 *                 description: The ID of the bank detail to update (optional)
 *               bankName:
 *                 type: string
 *                 description: The name of the bank
 *               accountNo:
 *                 type: string
 *                 description: The account number of the user
 *               holderName:
 *                 type: string
 *                 description: The name of the account holder
 *               bankcode:
 *                 type: string
 *                 description: The bank code
 *               country:
 *                 type: string
 *                 description: The country where the bank is located
 *               city:
 *                 type: string
 *                 description: The city where the bank is located
 *               bankAddress:
 *                 type: string
 *                 description: The address of the bank
 *               currencyId:
 *                 type: string
 *                 description: The ID of the currency used
 *               isPrimary:
 *                 type: boolean
 *                 description: Whether the bank account is the primary one
 *     responses:
 *       200:
 *         description: Successfully updated or added bank detail
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
 *                   example: "BANK_EDIT_SUCCESS"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       bankName:
 *                         type: string
 *                       accountNo:
 *                         type: string
 *                       holderName:
 *                         type: string
 *                       bankcode:
 *                         type: string
 *                       country:
 *                         type: string
 *                       city:
 *                         type: string
 *                       bankAddress:
 *                         type: string
 *                       currencyId:
 *                         type: string
 *                       currencySymbol:
 *                         type: string
 *                       isPrimary:
 *                         type: boolean
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
 *                   example: "SOMETHING_WRONG"
 */


/**
 * @swagger
 * /api/bankdetail:
 *   get:
 *     summary: Retrieve the bank details of a user
 *     tags:
 *       - Bank Details
 *     responses:
 *       200:
 *         description: Successfully retrieved bank details
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
 *                   example: "Success"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The ID of the bank detail
 *                       bankName:
 *                         type: string
 *                         description: The name of the bank
 *                       accountNo:
 *                         type: string
 *                         description: The account number of the user
 *                       holderName:
 *                         type: string
 *                         description: The name of the account holder
 *                       bankcode:
 *                         type: string
 *                         description: The bank code
 *                       country:
 *                         type: string
 *                         description: The country where the bank is located
 *                       city:
 *                         type: string
 *                         description: The city where the bank is located
 *                       bankAddress:
 *                         type: string
 *                         description: The address of the bank
 *                       currencyId:
 *                         type: string
 *                         description: The ID of the currency used
 *                       currencySymbol:
 *                         type: string
 *                         description: The currency symbol
 *                       isPrimary:
 *                         type: boolean
 *                         description: Whether the bank account is the primary one
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
 *                   example: "Error on server"
 */


/**
 * @swagger
 * /api/bankdetail:
 *   delete:
 *     summary: Delete a user's bank detail
 *     tags:
 *       - Bank Details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bankId:
 *                 type: string
 *                 description: The ID of the bank detail to be deleted
 *                 example: "60b8d295d3b44f5f402bde33"
 *     responses:
 *       200:
 *         description: Successfully deleted the bank detail
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
 *                   example: "BANK_DELETE_SUCCESS"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The ID of the bank detail
 *                       bankName:
 *                         type: string
 *                         description: The name of the bank
 *                       accountNo:
 *                         type: string
 *                         description: The account number of the user
 *                       holderName:
 *                         type: string
 *                         description: The name of the account holder
 *                       bankcode:
 *                         type: string
 *                         description: The bank code
 *                       country:
 *                         type: string
 *                         description: The country where the bank is located
 *                       city:
 *                         type: string
 *                         description: The city where the bank is located
 *                       bankAddress:
 *                         type: string
 *                         description: The address of the bank
 *                       currencyId:
 *                         type: string
 *                         description: The ID of the currency used
 *                       currencySymbol:
 *                         type: string
 *                         description: The currency symbol
 *                       isPrimary:
 *                         type: boolean
 *                         description: Whether the bank account is the primary one
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
 *                   example: "SOMETHING_WRONG"
 */


/**
 * @swagger
 * /api/bankdetail:
 *   put:
 *     summary: Set a bank account as primary
 *     tags:
 *       - Bank Details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bankId:
 *                 type: string
 *                 description: The ID of the bank account to be set as primary
 *                 example: "60b8d295d3b44f5f402bde33"
 *     responses:
 *       200:
 *         description: Successfully set the primary bank account
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
 *                   example: "BANK_SET_PRIMARY_SUCCESS"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The ID of the bank account
 *                       bankName:
 *                         type: string
 *                         description: The name of the bank
 *                       accountNo:
 *                         type: string
 *                         description: The account number of the user
 *                       holderName:
 *                         type: string
 *                         description: The name of the account holder
 *                       bankcode:
 *                         type: string
 *                         description: The bank code
 *                       country:
 *                         type: string
 *                         description: The country where the bank is located
 *                       city:
 *                         type: string
 *                         description: The city where the bank is located
 *                       bankAddress:
 *                         type: string
 *                         description: The address of the bank
 *                       currencyId:
 *                         type: string
 *                         description: The ID of the currency used
 *                       currencySymbol:
 *                         type: string
 *                         description: The currency symbol
 *                       isPrimary:
 *                         type: boolean
 *                         description: Whether the bank account is the primary one
 *       400:
 *         description: No data found or the bank account is not valid
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
 *                   example: "NO_DATA"
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
 *                   example: "SOMETHING_WRONG"
 */


/**
 * @swagger
 * /api/changePassword:
 *   put:
 *     summary: Change user password
 *     tags:
 *       - User Settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: The current password of the user
 *                 example: "oldPassword123"
 *               password:
 *                 type: string
 *                 description: The new password to be set for the user
 *                 example: "newPassword456"
 *     responses:
 *       200:
 *         description: Successfully updated the password
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
 *                   example: "PASSWORD_CHANGE_SUCCESS"
 *       400:
 *         description: Invalid request (e.g., passwords are the same or old password is incorrect)
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
 *                   example: "Old and New password must be different"
 *       500:
 *         description: Error on server (e.g., user not found or other server errors)
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
 * /api/security/2fa:
 *   get:
 *     summary: Get 2FA code for the user
 *     tags:
 *       - User Settings
 *     responses:
 *       200:
 *         description: Successfully retrieved the 2FA code
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
 *                   description: The generated 2FA code
 *                   example: 
 *                     code: "123456"
 *       500:
 *         description: Error on server (e.g., user not found, or other issues)
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
 * /api/security/2fa:
 *   post:
 *     summary: Update and enable 2FA for the user
 *     tags:
 *       - User Settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               secret:
 *                 type: string
 *                 description: The secret key for 2FA setup
 *                 example: "JBSWY3DPEHPK3PXP"
 *               code:
 *                 type: string
 *                 description: The verification code generated by the 2FA app
 *                 example: "123456"
 *               uri:
 *                 type: string
 *                 description: The URI for the 2FA QR code
 *                 example: "otpauth://totp/MyApp?secret=JBSWY3DPEHPK3PXP&issuer=MyApp"
 *     responses:
 *       200:
 *         description: Successfully updated and enabled 2FA for the user
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
 *                   example: "TWO_FA_ENABLE_SUCCESS"
 *                 result:
 *                   type: object
 *                   description: The 2FA code and user details after enabling
 *                   example: 
 *                     code: "123456"
 *                     secret: "JBSWY3DPEHPK3PXP"
 *                     uri: "otpauth://totp/MyApp?secret=JBSWY3DPEHPK3PXP&issuer=MyApp"
 *       400:
 *         description: Invalid 2FA code provided
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
 *                       example: "INVALID_CODE"
 *       500:
 *         description: Error on server (e.g., internal error while enabling 2FA)
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
 * /api/security/2fa:
 *   post:
 *     summary: Disable 2FA for the user
 *     tags:
 *       - User Settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               secret:
 *                 type: string
 *                 description: The secret key for 2FA
 *                 example: "JBSWY3DPEHPK3PXP"
 *               code:
 *                 type: string
 *                 description: The verification code generated by the 2FA app
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Successfully disabled 2FA for the user
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
 *                   example: "TWO_FA_DISABLE_SUCCESS"
 *                 result:
 *                   type: object
 *                   description: The result after disabling 2FA
 *                   example:
 *                     secret: ""
 *                     imageUrl: "https://example.com/qrcode.png"
 *                     uri: "otpauth://totp/MyApp?secret=&issuer=MyApp"
 *                     twoFaStatus: "disabled"
 *       400:
 *         description: Invalid 2FA code provided
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
 *                       example: "INVALID_CODE"
 *       500:
 *         description: Error on server (e.g., internal error while disabling 2FA)
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
 * /api/security/2fa:
 *   get:
 *     summary: Generate or retrieve the user's 2FA secret and QR code
 *     tags:
 *       - User Settings
 *     responses:
 *       200:
 *         description: Successfully generated or retrieved the 2FA details
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
 *                     secret:
 *                       type: string
 *                       description: The 2FA secret used for generating time-based one-time passwords
 *                       example: "JBSWY3DPEHPK3PXP"
 *                     imageUrl:
 *                       type: string
 *                       description: The URL of the QR code image for setting up 2FA
 *                       example: "https://example.com/qr-code.png"
 *                     uri:
 *                       type: string
 *                       description: The URI used for generating the 2FA QR code
 *                       example: "otpauth://totp/MyApp?secret=JBSWY3DPEHPK3PXP&issuer=MyApp"
 *                     twoFaStatus:
 *                       type: string
 *                       description: The current status of 2FA (enabled or disabled)
 *                       example: "enabled"
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
 *                   example: "SOMETHING_WRONG"
 */

/**
 * @swagger
 * /user-settings/default:
 *   post:
 *     summary: Set default user settings for a newly created user
 *     description: This API sets the default settings for a user, including currency symbol and language preferences.
 *     tags:
 *       - User Settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user for whom default settings are being created.
 *                 example: "5f8d0d55b5476470e7e2e64e"
 *     responses:
 *       200:
 *         description: Successfully set default settings for the user
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
 *                   example: "User default settings created successfully"
 *       400:
 *         description: Invalid user data or missing userId
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
 *                   example: "User data is empty or invalid"
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
 *                   example: "SOMETHING_WRONG"
 */

/**
 * @swagger
 * /api/userSetting:
 *   get:
 *     summary: Get user settings by user ID
 *     description: This API retrieves the user settings for the logged-in user.
 *     tags:
 *       - User Settings
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The ID of the user whose settings are being fetched.
 *         schema:
 *           type: string
 *           example: "5f8d0d55b5476470e7e2e64e"
 *     responses:
 *       200:
 *         description: Successfully retrieved user settings
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
 *                     userId:
 *                       type: string
 *                       description: The ID of the user.
 *                       example: "5f8d0d55b5476470e7e2e64e"
 *                     currencySymbol:
 *                       type: string
 *                       description: The user's preferred currency symbol.
 *                       example: "$"
 *                     languageId:
 *                       type: string
 *                       description: The user's preferred language ID.
 *                       example: "60d21b4667d0d8992e610c85"
 *       400:
 *         description: Invalid or missing user ID
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
 *                   example: "Invalid or missing user ID"
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
 *                   example: "SOMETHING_WRONG"
 */

/**
 * @swagger
 * /api/userSetting/:
 *   put:
 *     summary: Edit user settings by user ID
 *     description: This API allows users to update their settings, such as theme, currency symbol, and after-login behavior.
 *     tags:
 *       - User Settings
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The ID of the user whose settings are being updated.
 *         schema:
 *           type: string
 *           example: "5f8d0d55b5476470e7e2e64e"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 description: The user's preferred theme.
 *                 example: "dark"
 *               currencySymbol:
 *                 type: string
 *                 description: The user's preferred currency symbol.
 *                 example: "$"
 *               afterLogin:
 *                 type: string
 *                 description: The user's after-login preference (e.g., "dashboard", "profile").
 *                 example: "dashboard"
 *     responses:
 *       200:
 *         description: Successfully updated user settings
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
 *                   example: "EDIT_SETTING_SUCCESS"
 *                 result:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: The ID of the user.
 *                       example: "5f8d0d55b5476470e7e2e64e"
 *                     theme:
 *                       type: string
 *                       description: The user's updated theme.
 *                       example: "dark"
 *                     currencySymbol:
 *                       type: string
 *                       description: The user's updated currency symbol.
 *                       example: "$"
 *                     afterLogin:
 *                       type: string
 *                       description: The user's updated after-login preference.
 *                       example: "dashboard"
 *       400:
 *         description: Invalid request body or missing fields
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
 *                   example: "Invalid request body or missing fields"
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
 *                   example: "SOMETHING_WRONG"
 */

/**
 * @swagger
 * /api/editNotif:
 *   put:
 *     summary: Edit user notification settings
 *     description: This API allows users to update their notification settings, such as enabling/disabling 2FA alerts and login password change alerts.
 *     tags:
 *       - User Settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the notification setting being updated.
 *                 example: "twoFA"
 *               checked:
 *                 type: boolean
 *                 description: The new value for the notification setting (enabled or disabled).
 *                 example: true
 *     responses:
 *       200:
 *         description: Successfully updated notification setting
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
 *                   example: "2FA Alert Enabled Successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     currencySymbol:
 *                       type: string
 *                       description: The user's currency symbol.
 *                       example: "$"
 *                     theme:
 *                       type: string
 *                       description: The user's theme preference.
 *                       example: "dark"
 *                     afterLogin:
 *                       type: string
 *                       description: The user's after-login preference.
 *                       example: "dashboard"
 *                     languageId:
 *                       type: string
 *                       description: The ID of the user's language.
 *                       example: "60f7b8b2e3a51f001f2e6a3d"
 *                     timeZone:
 *                       type: string
 *                       description: The user's time zone.
 *                       example: "UTC+5:30"
 *                     twoFA:
 *                       type: boolean
 *                       description: Whether 2FA is enabled for the user.
 *                       example: true
 *                     passwordChange:
 *                       type: boolean
 *                       description: Whether login password change alert is enabled for the user.
 *                       example: false
 *                     siteNotification:
 *                       type: boolean
 *                       description: Whether site notifications are enabled for the user.
 *                       example: true
 *                     sellVacation:
 *                       type: boolean
 *                       description: Whether the user has set a vacation for selling items.
 *                       example: false
 *                     buyVacation:
 *                       type: boolean
 *                       description: Whether the user has set a vacation for buying items.
 *                       example: false
 *       400:
 *         description: Invalid request body or missing fields
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
 *                   example: "NO_DATA"
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
 *                   example: "SOMETHING_WRONG"
 */

/**
 * @swagger
 * /api/forgotPassword:
 *   post:
 *     summary: Check forgot password request with mobile/email
 *     description: This API is used to check the forgot password process either with mobile OTP or email verification link.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [mobile, email]
 *                 description: Type of verification (mobile or email)
 *               phoneCode:
 *                 type: string
 *                 description: The phone country code
 *               phoneNo:
 *                 type: string
 *                 description: The phone number
 *               otp:
 *                 type: string
 *                 description: The OTP sent to the phone (only for mobile type)
 *               email:
 *                 type: string
 *                 description: The user's email (only for email type)
 *               reCaptcha:
 *                 type: string
 *                 description: The reCaptcha token (for email type)
 *     responses:
 *       200:
 *         description: OTP sent successfully or email link sent
 *       400:
 *         description: Invalid OTP or email not found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /api/resetPassword:
 *   post:
 *     summary: Reset user password
 *     description: This API is used to reset the user's password after the OTP verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               authToken:
 *                 type: string
 *                 description: The token used to identify the user
 *               password:
 *                 type: string
 *                 description: The new password to set for the user
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /api/upgradeUser:
 *   post:
 *     summary: Upgrade user account to a different type
 *     description: This API allows users to upgrade their account type based on certain conditions and KYC status.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               upgradeType:
 *                 type: string
 *                 enum: [basic, advanced, pro]
 *                 description: The account type the user wants to upgrade to
 *     responses:
 *       200:
 *         description: Successfully upgraded account
 *       400:
 *         description: Invalid user state or KYC verification failed
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /api/phoneChange:
 *   post:
 *     summary: Change user's phone number
 *     description: Sends an OTP to the new phone number for verification and updates the user's phone number.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []  # Assuming authentication is done via a bearer token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPhoneCode:
 *                 type: string
 *                 description: The country code of the new phone number (e.g., "1" for the USA)
 *                 example: "1"
 *               newPhoneNo:
 *                 type: string
 *                 description: The new phone number to associate with the user.
 *                 example: "1234567890"
 *     responses:
 *       200:
 *         description: OTP sent successfully to the new phone number
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
 *                   example: "OTP sent successfully, It is only valid for 10 minutes"
 *       400:
 *         description: Bad request (e.g., phone number already exists, or incorrect format)
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
 *                     newPhoneNo:
 *                       type: string
 *                       example: "Phone number already exists"
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
 *                   example: "SOMETHING_WRONG"
 */

/**
 * @swagger
 * /api/phoneChange:
 *   post:
 *     summary: Verify the new phone number with OTP
 *     description: Verifies the new phone number using the OTP sent to the user and updates the user's phone status to 'verified'.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []  # Assuming authentication is done via a bearer token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *                 description: The OTP received by the user to verify their phone number
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Phone number successfully verified
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
 *                   example: "Mobile number verified"
 *                 result:
 *                   type: object
 *                   properties:
 *                     newPhoneCode:
 *                       type: string
 *                       example: "1"
 *                     newPhoneNo:
 *                       type: string
 *                       example: "1234567890"
 *       400:
 *         description: Bad request (e.g., invalid OTP)
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
 *                     otp:
 *                       type: string
 *                       example: "Invalid OTP"
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
 *                   example: "SOMETHING_WRONG"
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of users with pagination and filters
 *     description: Fetches a list of users based on the provided filters and pagination parameters.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: page
 *         in: query
 *         description: The page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: The number of items per page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: email
 *         in: query
 *         description: Filter users by email
 *         required: false
 *         schema:
 *           type: string
 *           example: "user@example.com"
 *       - name: status
 *         in: query
 *         description: Filter users by status (e.g., active, inactive)
 *         required: false
 *         schema:
 *           type: string
 *           example: "active"
 *       - name: phoneNo
 *         in: query
 *         description: Filter users by phone number
 *         required: false
 *         schema:
 *           type: string
 *           example: "1234567890"
 *     responses:
 *       200:
 *         description: Successfully retrieved list of users
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
 *                           _id:
 *                             type: string
 *                             example: "60c5fbb0f85e1a001f0d7e8a"
 *                           userId:
 *                             type: string
 *                             example: "user123"
 *                           email:
 *                             type: string
 *                             example: "user@example.com"
 *                           phoneCode:
 *                             type: string
 *                             example: "1"
 *                           phoneNo:
 *                             type: string
 *                             example: "1234567890"
 *                           google2Fa:
 *                             type: object
 *                             properties:
 *                               secret:
 *                                 type: string
 *                                 example: "secret_string"
 *                           emailStatus:
 *                             type: string
 *                             example: "verified"
 *                           phoneStatus:
 *                             type: string
 *                             example: "verified"
 *                           binSubAcctId:
 *                             type: string
 *                             example: "binSubAcct123"
 *                           binSubAcctEmail:
 *                             type: string
 *                             example: "subacct@example.com"
 *                           status:
 *                             type: string
 *                             example: "active"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-10-01T12:00:00Z"
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
 *                   example: "error on server"
 */


/**
 * @swagger
 * /api/emailChange:
 *   post:
 *     summary: Update user's email address
 *     description: Allows a user to change their email address. Sends a verification email to the new email address or to the old email address for verification.
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newEmail:
 *                 type: string
 *                 format: email
 *                 description: The new email address that the user wants to set
 *                 example: "newemail@example.com"
 *     responses:
 *       200:
 *         description: Verification link sent successfully
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
 *                   example: "Verification link sent to your email address."
 *       400:
 *         description: Invalid request, email already exists
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
 *                     newEmail:
 *                       type: string
 *                       example: "Email already exists"
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
 * /api/emailChange:
 *   post:
 *     summary: Send email verification link to a new email address
 *     description: This endpoint sends a verification link to a user's new email address. The link is valid only if the token matches the stored token for email change.
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token used for verifying the email change request
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
 *     responses:
 *       200:
 *         description: Verification link successfully sent to the new email address
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
 *                   example: "Verification link sent to your new email address."
 *       400:
 *         description: Invalid link, token mismatch or expired
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
 *                   example: "Invalid Link"
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
 * /api/emailChange:
 *   post:
 *     summary: Verify and update the new email address for the user
 *     description: This endpoint verifies the provided token and updates the user's email address if the token is valid. If the new email already exists, an error will be returned.
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token used for verifying the email change request
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Email address successfully updated
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
 *                   example: "Change email address successfully"
 *       400:
 *         description: Email already exists or other client-side validation errors
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
 *                   example: "Email already exists"
 *       500:
 *         description: Server error or invalid token
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
 *                   example: "Invalid link"
 */

/**
 * @swagger
 * /update-status:
 *   post:
 *     summary: Update the verification status of a user
 *     description: This endpoint allows changing the user's status between 'verified' and 'unverified'. If the user is already 'unverified', it updates the status to 'verified', and vice versa.
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The unique ID of the user whose status needs to be updated
 *                 example: "607d1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: User status updated successfully
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
 *         description: Error occurred while updating the user status or invalid status
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
 *       404:
 *         description: User not found
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
 *                   example: "user Not Found"
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
 *                   example: "something went wrong"
 */


/**
 * @swagger
 * /disable-2fa:
 *   post:
 *     summary: Disable 2FA for a user
 *     description: This endpoint disables two-factor authentication (2FA) for a user by clearing the 2FA secret and URI from their account.
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The unique ID of the user who wants to disable 2FA
 *                 example: "607d1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: 2FA successfully disabled
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
 *         description: Error disabling 2FA or user does not have 2FA enabled
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
 *       404:
 *         description: User not found
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
 *                   example: "User not found"
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
 * /api/add-fav:
 *   post:
 *     summary: Add or remove item from favorites
 *     description: Adds or removes an item from a user's favorites list based on the request type ('remove' or other). If the item already exists in favorites, it will be removed before being added again.
 *     tags:
 *       - User Settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               item:
 *                 type: string
 *                 description: The item to be added or removed from favorites.
 *                 example: "item123"
 *               type:
 *                 type: string
 *                 description: Action type ('remove' to remove the item, other types to add it).
 *                 example: "add"
 *     responses:
 *       200:
 *         description: Item added to favorites successfully.
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
 *                   example: "Favorite Added"
 *       400:
 *         description: Invalid request or item not found.
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
 *                   example: "Not Found"
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
 *                   example: "Something wrong"
 */

/**
 * @swagger
 * /api/get-fav:
 *   get:
 *     summary: Get a list of user's favorite items
 *     description: Fetches the list of favorite items for the authenticated user.
 *     tags:
 *       - User Settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched favorite items.
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
 *                     type: string
 *                   example: ["item123", "item456"]
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
 *                   example: "Something wrong"
 */

/**
 * @swagger
 * /api/hide-btn:
 *   get:
 *     summary: Get the status of the profile edit button
 *     description: Returns the current status of the profile edit button for the authenticated user.
 *     tags:
 *       - User Settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched button status.
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
 *                     status:
 *                       type: boolean
 *                       example: true
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
 *                   example: "Something wrong"
 */

/**
 * @swagger
 * /api/Statistic:
 *   get:
 *     summary: Get user's trade data
 *     description: Fetches a summary of the user's completed trades, derivative orders, open P2P orders, and completed P2P orders.
 *     tags:
 *       - Trades
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched trade data.
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
 *                     spotCompleted:
 *                       type: integer
 *                       example: 10
 *                     TotalDerivative:
 *                       type: integer
 *                       example: 5
 *                     p2pOpenOrder:
 *                       type: integer
 *                       example: 3
 *                     p2pCompleteOrder:
 *                       type: integer
 *                       example: 7
 *       400:
 *         description: No data found.
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
 *                   example: "Not found"
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
 *                   example: "Error on server"
 */

/**
 * @swagger
 * /api/checkEmail:
 *   get:
 *     summary: Check user's email details
 *     description: Fetches the email details of the authenticated user.
 *     tags:
 *       - User Settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched user email details.
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
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
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
 *                   example: "Error on server"
 */


/**
 * @swagger
 * /api/confirm-mail:
 *   post:
 *     summary: Verify the user's email after confirming the provided URL
 *     tags:
 *       - User Settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Encrypted user ID to identify the user for email verification.
 *                 example: "encrypted_user_id_example"
 *     responses:
 *       200:
 *         description: Successfully verified the user's email
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
 *                   example: "Your email has been verified, you can now log in"
 *       400:
 *         description: Bad request, e.g., user not found or email already verified
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
 *                   example: "Url expired"
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
 * /api/sentOTP:
 *   post:
 *     summary: Send an OTP to the specified phone number for login or forgot password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneCode:
 *                 type: string
 *                 description: The country code for the phone number (e.g., +1 for the US).
 *                 example: "1"
 *               phoneNo:
 *                 type: string
 *                 description: The phone number to which the OTP will be sent.
 *                 example: "1234567890"
 *               type:
 *                 type: string
 *                 description: The type of OTP request (login or forgot).
 *                 enum: [login, forgot]
 *                 example: "login"
 *               password:
 *                 type: string
 *                 description: The password for authentication (only required for login type).
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: OTP sent successfully
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
 *                   example: "OTP sent successfully, It is only valid for 10 minutes"
 *       400:
 *         description: Bad request, e.g., invalid phone number, incorrect password, or max send attempts reached
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
 *                     phone:
 *                       type: string
 *                       example: "Phone number not exists"
 *                     password:
 *                       type: string
 *                       example: "Password incorrect"
 *                     phoneNo:
 *                       type: string
 *                       example: "Max send attempts reached"
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
 * /api/sentOTP:
 *   post:
 *     summary: Check if the mobile number exists for registration or login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneCode:
 *                 type: string
 *                 description: The country code for the phone number (e.g., +1 for the US).
 *                 example: "1"
 *               phoneNo:
 *                 type: string
 *                 description: The phone number to check.
 *                 example: "1234567890"
 *               type:
 *                 type: string
 *                 description: The type of request (register or login).
 *                 enum: [register, login]
 *                 example: "register"
 *     responses:
 *       200:
 *         description: Successfully passed the mobile check and can proceed
 *       400:
 *         description: The phone number already exists for registration or does not exist for login
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
 *                   example: "Phone number already exist"
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
 * /checkDeposit:
 *   post:
 *     summary: Check deposits for supported currencies and process deposits accordingly
 *     tags: [Deposit]
 *     responses:
 *       200:
 *         description: Deposits were checked and processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Error occurred during the deposit check process
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Internal server error
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
 * /api/getAssetsDetails:
 *   get:
 *     summary: Fetch the user's wallet details along with associated assets
 *     tags: [Wallet]
 *     responses:
 *       200:
 *         description: Successfully retrieved wallet information and assets
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
 *                   example: "successfully"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       coin:
 *                         type: string
 *                       address:
 *                         type: string
 *                       destTag:
 *                         type: string
 *                       spotBal:
 *                         type: number
 *                       derivativeBal:
 *                         type: number
 *                       p2pBal:
 *                         type: number
 *       400:
 *         description: Wallet data not found or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
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
 *                   example: "Something went wrong"
 */


/**
 * @swagger
 * /api/getHideoZeroStatus:
 *   get:
 *     summary: Get the user's "Hide Zero Status" setting
 *     tags: [Wallet]
 *     responses:
 *       200:
 *         description: Successfully retrieved the "Hide Zero Status" value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 hideZeroStatus:
 *                   type: object
 *                   properties:
 *                     hideZeroStatus:
 *                       type: boolean
 *                       example: true
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
 *                   example: "Error retrieving hideZeroStatus"
 */

/**
 * @swagger
 * /api/getHideoZeroStatus:
 *   post:
 *     summary: Update the user's "Hide Zero Status" setting
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hideZeroStatus:
 *                 type: boolean
 *                 description: Set whether zero balance assets should be hidden or not.
 *                 example: true
 *     responses:
 *       200:
 *         description: Successfully updated the "Hide Zero Status" setting
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
 *                   example: "Zero balance assets hidden successfully"
 *       400:
 *         description: Invalid request data
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
 *                   example: "Invalid input data"
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
 *                   example: "Error updating hideZeroStatus"
 */

/**
 * @swagger
 * /api/getbalance:
 *   get:
 *     summary: Get the balance of a specific coin for the user
 *     description: Fetches the balance for a given coin based on the user ID.
 *     parameters:
 *       - name: symbol
 *         in: query
 *         required: true
 *         description: The coin symbol for which balance is requested (e.g., BTC, ETH)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched the balance
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
 *                     coin:
 *                       type: string
 *                       example: "BTC"
 *                     coinbal:
 *                       type: number
 *                       example: 0.12345
 *       400:
 *         description: User not found or coin not found
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
 *                   example: "USER_NOT_FOUND"
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
 *                   example: "Error occurred while fetching balance"
 */


/**
 * @swagger
 * /api/WithdrawApprove:
 *   post:
 *     summary: Approve a withdrawal
 *     description: Approves a withdrawal request and processes the transaction.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The token to decrypt and identify the transaction.
 *     responses:
 *       200:
 *         description: Successfully processed withdrawal
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
 *                   example: "Withdraw successfully"
 *       400:
 *         description: Invalid token or error in processing the withdrawal
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
 *                   example: "Invalid Token"
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
 * /api/WithdrawCancel:
 *   post:
 *     summary: Cancel a pending withdrawal
 *     description: Cancels a pending withdrawal request and refunds the amount to the user's balance.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The token to decrypt and identify the transaction.
 *     responses:
 *       200:
 *         description: Successfully canceled withdrawal
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
 *                   example: "Request Cancelled Successfully!!!"
 *       400:
 *         description: Invalid token or error in processing the cancellation
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
 *                   example: "Invalid Token"
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
 * /api/get-asset-by-currency/{currencyId}:
 *   get:
 *     summary: Get asset details for a specific currency
 *     description: Fetches the asset details for a specific currency for a user's wallet.
 *     parameters:
 *       - name: currencyId
 *         in: path
 *         description: The ID of the currency for which to fetch the asset details.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved asset details
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
 *                     spotBal:
 *                       type: number
 *                       example: 1500
 *                     derivativeBal:
 *                       type: number
 *                       example: 200
 *                     currencyId:
 *                       type: string
 *                       example: "currencyId123"
 *       400:
 *         description: Wallet or currency not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 messages:
 *                   type: string
 *                   example: "NOT_FOUND"
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
 *                   example: "Error occured"
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     WithdrawFiatRequest:
 *       type: object
 *       properties:
 *         x-api-key:
 *           type: string
 *           description: API key required for authorization (Optional, only used if 'Authorization' header is missing)
 *         Authorization:
 *           type: string
 *           description: Bearer token used for authorization and user authentication.
 *         bankId:
 *           type: string
 *           description: The ID of the user's bank account used for the fiat withdrawal.
 *         currencyId:
 *           type: string
 *           description: The ID of the currency for the withdrawal request.
 *         amount:
 *           type: number
 *           description: The withdrawal amount in the requested currency.
 *         twoFACode:
 *           type: string
 *           description: The two-factor authentication code sent to the user for verification.
 *   securitySchemes:
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: x-api-key
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 * 
 * /api/fiatWithdraw:
 *   post:
 *     summary: Initiate a fiat withdrawal request with two-factor authentication and account validation.
 *     description: This endpoint handles the fiat withdrawal request after validating the user's account and two-factor authentication.
 *     operationId: withdrawFiatRequest
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WithdrawFiatRequest'
 *     responses:
 *       200:
 *         description: Fiat withdrawal request initiated successfully, with verification link sent to user's email.
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
 *                   example: "VERIFICATION_LINK"
 *                 result:
 *                   type: object
 *                   properties:
 *                     assets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           spotBal:
 *                             type: number
 *                             example: 100.0
 *                           derivativeBal:
 *                             type: number
 *                             example: 50.0
 *       400:
 *         description: Invalid bank account or insufficient funds, or invalid two-factor authentication code.
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
 *                     bankId:
 *                       type: string
 *                       example: "INVALID_BANK_ACCOUNT"
 *                     twoFACode:
 *                       type: string
 *                       example: "INVALID_CODE"
 *       500:
 *         description: Internal server error, unexpected failure.
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
 * tags:
 *   - name: Deposit
 *     description: Deposit related operations
 */

/**
 * @swagger
 * /api/fiatDeposit:
 *   post:
 *     summary: Request a fiat deposit
 *     description: Allows a user to request a fiat deposit with their asset.
 *     tags:
 *       - Deposit
 *     consumes:
 *       - application/json
 *       - multipart/form-data
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         type: string
 *         required: true
 *         description: API key for authentication.
 *       - in: body
 *         name: depositRequest
 *         required: true
 *         description: The deposit request payload.
 *         schema:
 *           type: object
 *           required:
 *             - userAssetId
 *             - amount
 *           properties:
 *             userAssetId:
 *               type: string
 *               description: The ID of the user's asset to deposit into.
 *             amount:
 *               type: number
 *               format: float
 *               description: The amount to deposit.
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: Proof of deposit (image file).
 *     responses:
 *       200:
 *         description: Deposit request successfully created.
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
 *                   example: "DEPOSIT_REQUEST_SUCCESS"
 *       400:
 *         description: Bad request or missing data.
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
 *                   example: "NO_DATA"
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
 *                   example: "SOMETHING_WRONG"
 */


/**
 * @swagger
 * tags:
 *   - name: Wallet
 *     description: Operations related to wallet transfers
 */

/**
 * @swagger
 * /api/walletTransfer:
 *   post:
 *     summary: Transfer assets between wallet types (spot, derivative, p2p)
 *     description: Allows users to transfer funds between different wallet types (spot, derivative, p2p) based on their available balance.
 *     tags:
 *       - Wallet
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         type: string
 *         required: true
 *         description: API key for authentication.
 *       - in: body
 *         name: walletTransfer
 *         required: true
 *         description: The wallet transfer request payload.
 *         schema:
 *           type: object
 *           required:
 *             - userAssetId
 *             - fromType
 *             - toType
 *             - amount
 *           properties:
 *             userAssetId:
 *               type: string
 *               description: The ID of the asset to transfer.
 *             fromType:
 *               type: string
 *               enum:
 *                 - spot
 *                 - derivative
 *                 - p2p
 *               description: The wallet type from which the funds are being transferred.
 *             toType:
 *               type: string
 *               enum:
 *                 - spot
 *                 - derivative
 *                 - p2p
 *               description: The wallet type to which the funds are being transferred.
 *             amount:
 *               type: number
 *               format: float
 *               description: The amount to transfer.
 *     responses:
 *       200:
 *         description: Wallet transfer successfully completed.
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
 *                   example: "WALLET_TRANSFER_SUCCESS"
 *       400:
 *         description: Bad request or insufficient balance.
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
 *                   example: "INSUFFICIENT_BALANCE"
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
 *                   example: "SOMETHING_WRONG"
 */


/**
 * @swagger
 * tags:
 *   - name: Fund Transfer
 *     description: Operations related to transferring funds between users
 */

/**
 * @swagger
 * /api/fundTransfer:
 *   post:
 *     summary: Transfer funds between users' wallets
 *     description: Allows users to transfer funds to another user, with validation for 2FA and sufficient balance.
 *     tags:
 *       - Fund Transfer
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         type: string
 *         required: true
 *         description: API key for authentication.
 *       - in: body
 *         name: fundTransfer
 *         required: true
 *         description: The fund transfer request payload.
 *         schema:
 *           type: object
 *           required:
 *             - toUserEmail
 *             - currencyId
 *             - amount
 *             - twoFACode
 *           properties:
 *             toUserEmail:
 *               type: string
 *               description: The email of the user receiving the transfer.
 *             currencyId:
 *               type: string
 *               description: The ID of the currency being transferred.
 *             amount:
 *               type: number
 *               format: float
 *               description: The amount to transfer.
 *             twoFACode:
 *               type: string
 *               description: The 2FA code for verification.
 *     responses:
 *       200:
 *         description: Fund transfer successfully completed.
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
 *                   example: "Amount transfer successfully"
 *       400:
 *         description: Bad request or insufficient balance.
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
 *                     twoFACode:
 *                       type: string
 *                       example: "Invalid Code"
 *                     finalAmount:
 *                       type: string
 *                       example: "INSUFFICIENT_BALANCE"
 *       500:
 *         description: Internal server error or missing 2FA setup.
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
 *                     twoFACode:
 *                       type: string
 *                       example: "Please enable two factor authentication"
 *                 message:
 *                   type: string
 *                   example: "Error on server"
 */

/**
 * @swagger
 * tags:
 *   - name: Transaction History
 *     description: Operations related to fetching transaction history for a user
 */

/**
 * @swagger
 * /api/history/transaction/{paymentType}:
 *   get:
 *     summary: Get the transaction history of a user
 *     description: Retrieves the transaction history based on payment type (crypto, fiat, or token) and applies filters for different transaction types and pagination.
 *     tags:
 *       - Transaction History
 *     parameters:
 *       - in: path
 *         name: paymentType
 *         required: true
 *         description: The type of payment to filter transactions by (fiat, crypto, token).
 *         schema:
 *           type: string
 *           enum: [fiat, crypto, token]
 *       - in: query
 *         name: type
 *         description: Filter the transactions by type (e.g., deposit, withdraw, transfer, etc.).
 *         schema:
 *           type: string
 *           enum: [all, deposit, withdraw, transfer]
 *       - in: query
 *         name: coin
 *         description: Filter the transactions by coin type (e.g., BTC, ETH, etc.).
 *         schema:
 *           type: string
 *           default: 'all'
 *       - in: query
 *         name: page
 *         description: The page number for pagination.
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: The number of transactions to return per page.
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved the transaction history.
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
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           paymentType:
 *                             type: string
 *                           coin:
 *                             type: string
 *                           amount:
 *                             type: number
 *                             format: float
 *                           bankDetail:
 *                             type: string
 *                           status:
 *                             type: string
 *                           toAddress:
 *                             type: string
 *                     count:
 *                       type: integer
 *                       example: 25
 *       400:
 *         description: Invalid payment type or query parameters.
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
 *                   example: "Invalid type"
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
 *                   example: "Error on server"
 */


/**
 * @swagger
 * tags:
 *   - name: Transaction History
 *     description: Operations related to fetching recent transactions for a user
 */

/**
 * @swagger
 * /api/recentTransaction:
 *   get:
 *     summary: Get the most recent transactions of a user
 *     description: Retrieves the 5 most recent transactions based on the user's ID, including details like payment type, coin, amount, status, and transaction ID.
 *     tags:
 *       - Transaction History
 *     responses:
 *       200:
 *         description: Successfully retrieved the most recent transactions.
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
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       paymentType:
 *                         type: string
 *                       coin:
 *                         type: string
 *                       actualAmount:
 *                         type: number
 *                         format: float
 *                       amount:
 *                         type: number
 *                         format: float
 *                       txid:
 *                         type: string
 *                       status:
 *                         type: string
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
 *                   example: "SOMETHING_WRONG"
 */

/**
 * @swagger
 * tags:
 *   - name: User Activity
 *     description: Operations related to fetching user activity history
 */

/**
 * @swagger
 * /api/loginHistory:
 *   get:
 *     summary: Get the login history of a user
 *     description: Retrieves the 5 most recent login records for the user, including details like login date, IP address, region, country, browser, OS, and login status.
 *     tags:
 *       - User Activity
 *     responses:
 *       200:
 *         description: Successfully retrieved the login history.
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
 *                       createdDate:
 *                         type: string
 *                         format: date-time
 *                       ipaddress:
 *                         type: string
 *                       regionName:
 *                         type: string
 *                       countryName:
 *                         type: string
 *                       broswername:
 *                         type: string
 *                       os:
 *                         type: string
 *                       status:
 *                         type: string
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
 *                   example: "SOMETHING_WRONG"
 */

/**
 * @swagger
 * tags:
 *   - name: User Activity
 *     description: Operations related to fetching user activity history, including notifications
 */

/**
 * @swagger
 * /api/notificationHistory:
 *   get:
 *     summary: Get the notification history of a user
 *     description: Retrieves the 5 most recent notifications for the user, including details like the notification content and timestamp.
 *     tags:
 *       - User Activity
 *     responses:
 *       200:
 *         description: Successfully retrieved the notification history.
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
 *                       _id:
 *                         type: string
 *                         description: The unique identifier for the notification.
 *                       message:
 *                         type: string
 *                         description: The content of the notification.
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: The timestamp when the notification was created.
 *                       readStatus:
 *                         type: boolean
 *                         description: Indicates if the notification has been read by the user.
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
 *                   example: "SOMETHING_WRONG"
 */

/**
 * @swagger
 * /api/getDashBal:
 *   get:
 *     summary: Get user dashboard balance
 *     description: Fetches the dashboard balance for a user, including details like derivative balance, spot balance, and p2p balance.
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard balance fetched successfully
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
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       currency:
 *                         type: string
 *                         example: "USD"
 *                       coin:
 *                         type: string
 *                         example: "Bitcoin"
 *                       derivativeBal:
 *                         type: number
 *                         example: 0.0
 *                       spotBal:
 *                         type: number
 *                         example: 1500.25
 *                       p2pBal:
 *                         type: number
 *                         example: 300.0
 *                       colorCode:
 *                         type: string
 *                         example: "#FF5733"
 *       400:
 *         description: No records found
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
 *                   example: "No record"
 *       401:
 *         description: Unauthorized access
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
 *                   example: "Unauthorized"
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
 *                   example: "SOMETHING_WRONG"
 */

/**
 * @swagger
 * /api/gettradehistory_dash:
 *   get:
 *     summary: Fetch trade history
 *     description: Retrieves the trade history of the user, including order details, fees, and order value.
 *     tags:
 *       - Trade
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: The number of records per page.
 *     responses:
 *       200:
 *         description: Trade history fetched successfully
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
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-11-14T09:30:00Z"
 *                       firstCurrency:
 *                         type: string
 *                         example: "BTC"
 *                       secondCurrency:
 *                         type: string
 *                         example: "USDT"
 *                       orderType:
 *                         type: string
 *                         example: "limit"
 *                       quantity:
 *                         type: number
 *                         example: 0.5
 *                       buyorsell:
 *                         type: string
 *                         example: "buy"
 *                       price:
 *                         type: number
 *                         example: 30000
 *                       filledQuantity:
 *                         type: number
 *                         example: 0.4
 *                       Fees:
 *                         type: number
 *                         example: 0.1
 *                       orderValue:
 *                         type: number
 *                         example: 12000
 *                 count:
 *                   type: integer
 *                   example: 25
 *                 reportData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-11-14T09:30:00Z"
 *                       firstCurrency:
 *                         type: string
 *                         example: "BTC"
 *                       secondCurrency:
 *                         type: string
 *                         example: "USDT"
 *                       orderType:
 *                         type: string
 *                         example: "limit"
 *                       buyorsell:
 *                         type: string
 *                         example: "buy"
 *                       price:
 *                         type: number
 *                         example: 30000
 *                       filledQuantity:
 *                         type: number
 *                         example: 0.4
 *                       Fees:
 *                         type: number
 *                         example: 0.1
 *                       orderValue:
 *                         type: number
 *                         example: 12000
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
 */


/**
 * @swagger
 * /api/Statistic:
 *   get:
 *     summary: Get all trade statistics
 *     description: Retrieves a summary of completed spot trades, total derivatives, open P2P orders, and completed P2P orders for the logged-in user.
 *     tags:
 *       - Trade
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Trade data fetched successfully
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
 *                     spotCompleted:
 *                       type: integer
 *                       example: 10
 *                     TotalDerivative:
 *                       type: integer
 *                       example: 5
 *                     p2pOpenOrder:
 *                       type: integer
 *                       example: 3
 *                     p2pCompleteOrder:
 *                       type: integer
 *                       example: 8
 *       400:
 *         description: No data found
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
 *                   example: Not found
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
 *                   example: error on server
 */

/**
 * @swagger
 * /api/get-notification:
 *   get:
 *     summary: Get all notifications
 *     description: Fetch all notifications for the logged-in user, including their description, created date, and read status.
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
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
 *                       description:
 *                         type: string
 *                         example: "You have a new message."
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-11-15T12:00:00.000Z"
 *                       isRead:
 *                         type: boolean
 *                         example: false
 *       400:
 *         description: Notifications not found
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
 *                   example: "Not Found"
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
 *                   example: "something went wrong"
 */


/**
 * @swagger
 * /api/unread-notice:
 *   get:
 *     summary: Get unread notifications
 *     description: Fetch all unread notifications for the logged-in user, including their description and created date.
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notifications fetched successfully
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
 *                       description:
 *                         type: string
 *                         example: "You have a new message."
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-11-15T12:00:00.000Z"
 *       400:
 *         description: No unread notifications found
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
 *                   example: "Not Found"
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
 *                   example: "something went wrong"
 */


/**
 * @swagger
 * /api/read-notification:
 *   put:
 *     summary: Mark all notifications as read
 *     description: Updates all unread notifications for the logged-in user to be marked as read.
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Error updating notifications
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
 *                   example: "Error"
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
 *                   example: "something went wrong"
 */


/**
 * @swagger
 * /api/readsingel-notification:
 *   put:
 *     summary: Mark a single notification as read
 *     description: Updates a specific notification by ID for the logged-in user to be marked as read.
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the notification to mark as read
 *         schema:
 *           type: string
 *           example: "6469f9eb8c530541f097f413"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isRead:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Error updating notification
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
 *                   example: "Error"
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
 *                   example: "something went wrong"
 */


/**
 * @swagger
 * /api/create-notification:
 *   post:
 *     summary: Create a new notification
 *     description: Creates a new notification document and emits the unread notifications to the user via a socket event.
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user to whom the notification belongs.
 *                 example: "6469f9eb8c530541f097f413"
 *               description:
 *                 type: string
 *                 description: The content of the notification.
 *                 example: "Your transaction was successful."
 *               isRead:
 *                 type: boolean
 *                 description: Indicates whether the notification has been read.
 *                 example: false
 *     responses:
 *       200:
 *         description: Notification created successfully and event emitted.
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 *               example: true
 *       500:
 *         description: Server error occurred while creating the notification.
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 *               example: false
 */


/**
 * @swagger
 * /api/getLanguage:
 *   get:
 *     summary: Get active languages
 *     description: Fetch all active languages with selected fields.
 *     tags:
 *       - Languages
 *     responses:
 *       200:
 *         description: Successfully fetched active languages.
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
 *                       code:
 *                         type: string
 *                       name:
 *                         type: string
 *                       isPrimary:
 *                         type: boolean
 *                       status:
 *                         type: string
 *       500:
 *         description: Something went wrong.
 */

/**
 * @swagger
 * /api/getCurrency:
 *   get:
 *     summary: Get active currencies
 *     description: Fetch all active currencies with relevant details.
 *     tags:
 *       - Currencies
 *     responses:
 *       200:
 *         description: Successfully fetched active currencies.
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
 *                       coin:
 *                         type: string
 *                       symbol:
 *                         type: string
 *                       image:
 *                         type: string
 *                       type:
 *                         type: string
 *                       withdrawFee:
 *                         type: number
 *                       minimumWithdraw:
 *                         type: number
 *                       depositStatus:
 *                         type: boolean
 *                       withdrawStatus:
 *                         type: boolean
 *       500:
 *         description: Something went wrong.
 */


/**
 * @swagger
 * /api/getSocialMedia:
 *   get:
 *     summary: Get social media links
 *     description: Fetch social media links from the site settings.
 *     tags:
 *       - Social Media
 *     responses:
 *       200:
 *         description: Successfully fetched social media links.
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
 *                     facebookLink:
 *                       type: string
 *                     linkedinLink:
 *                       type: string
 *                     twitterUrl:
 *                       type: string
 *       500:
 *         description: Something went wrong.
 */


/**
 * @swagger
 * /api/getMarketTrend:
 *   get:
 *     summary: Get market trends
 *     description: Fetch market trends from the database with related currency information.
 *     tags:
 *       - Market Trend
 *     responses:
 *       200:
 *         description: Successfully fetched market trends.
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
 *                       secondCurrencySymbol:
 *                         type: string
 *                       markPrice:
 *                         type: number
 *                       change:
 *                         type: number
 *       500:
 *         description: Something went wrong.
 */


/**
 * @swagger
 * /api/getCmsData:
 *   get:
 *     summary: Get CMS data
 *     description: Fetch CMS data from the database.
 *     tags:
 *       - CMS
 *     responses:
 *       200:
 *         description: Successfully fetched CMS data.
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
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *       500:
 *         description: Something went wrong.
 */


/**
 * @swagger
 * /api/getFaqTrend:
 *   get:
 *     summary: Retrieve the trending FAQs.
 *     tags: [FAQ]
 *     responses:
 *       200:
 *         description: Successfully fetched trending FAQs.
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
 *                       question:
 *                         type: string
 *                       answer:
 *                         type: string
 *       400:
 *         description: No setting found for FAQ trend.
 *       500:
 *         description: Server error.
 */


/**
 * @swagger
 * /api/getPairData:
 *   get:
 *     summary: Get pair data based on symbols.
 *     tags: [Spot Pair]
 *     parameters:
 *       - name: firstCurrencySymbol
 *         in: query
 *         description: First currency symbol (e.g., BTC)
 *         required: true
 *         schema:
 *           type: string
 *       - name: secondCurrencySymbol
 *         in: query
 *         description: Second currency symbol (e.g., USD)
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched pair data.
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
 *                     markPrice:
 *                       type: number
 *       500:
 *         description: Server error.
 */


/**
 * @swagger
 * /api/priceConversion:
 *   get:
 *     summary: Retrieve price conversion data
 *     description: This API returns the conversion data for various currency symbols.
 *     responses:
 *       200:
 *         description: Price conversion data fetched successfully
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
 *                       baseSymbol:
 *                         type: string
 *                       convertSymbol:
 *                         type: string
 *                       convertPrice:
 *                         type: number
 *                         example: 1.23
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
 * /api/historyFilter:
 *   get:
 *     summary: Retrieve filters for P2P, spot, and derivative history
 *     description: This API returns various filters for P2P, spot, and derivative history, such as coin lists, pair lists, and order types.
 *     responses:
 *       200:
 *         description: Filters fetched successfully
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
 *                     p2pFilter:
 *                       type: object
 *                       properties:
 *                         coinList:
 *                           type: array
 *                           items:
 *                             type: string
 *                         payment:
 *                           type: array
 *                           items:
 *                             type: string
 *                     spotFilter:
 *                       type: object
 *                       properties:
 *                         pairList:
 *                           type: array
 *                           items:
 *                             type: string
 *                         orderTypes:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               label:
 *                                 type: string
 *                               value:
 *                                 type: string
 *                     derivativeFilter:
 *                       type: object
 *                       properties:
 *                         pairList:
 *                           type: array
 *                           items:
 *                             type: string
 *                         orderTypes:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               label:
 *                                 type: string
 *                               value:
 *                                 type: string
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
 *                   example: Error on server
 */

  
/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit a new contact message
 *     description: This API allows users to submit a new contact message, including name, email, subject, and message.
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
 *                 example: "johndoe@example.com"
 *               subject:
 *                 type: string
 *                 example: "Inquiry about services"
 *               message:
 *                 type: string
 *                 example: "Hello, I would like to inquire about your services."
 *     responses:
 *       200:
 *         description: Message submitted successfully
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
 *                   example: "Your Message submitted successfully"
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
 *                   example: "Error on server"
 */


/**
 * @swagger
 * /api/announcement:
 *   get:
 *     summary: Get the latest announcement
 *     description: Fetches the most recent announcement whose `endDateTime` is greater than the current UTC time.
 *     responses:
 *       200:
 *         description: Successfully fetched the announcement
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
 *                   example: "Successfully added"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       content:
 *                         type: string
 *                         example: "Announcement content here"
 *       500:
 *         description: Error occurred while fetching the announcement
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
 * /api/getannouncement:
 *   get:
 *     summary: Get all announcements
 *     description: Fetches all available announcements.
 *     responses:
 *       200:
 *         description: Successfully fetched all announcements
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
 *                   example: "Successfully added"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       content:
 *                         type: string
 *                         example: "Announcement content here"
 *       500:
 *         description: Error occurred while fetching the announcements
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
 * /api/cms/{identifier}:
 *   get:
 *     summary: Get a CMS page by its identifier
 *     description: Fetches a CMS page based on the provided identifier and returns its title and content.
 *     parameters:
 *       - name: identifier
 *         in: path
 *         required: true
 *         description: The unique identifier for the CMS page.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched CMS page
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
 *                   example: "FETCH_SUCCESS"
 *                 result:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "CMS Page Title"
 *                     content:
 *                       type: string
 *                       example: "CMS Page Content"
 *       500:
 *         description: Something went wrong
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
 * /api/fetch-cms:
 *   post:
 *     summary: Get all CMS pages by language
 *     description: Fetches CMS pages filtered by language. Defaults to English if no language is provided.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lang:
 *                 type: string
 *                 example: "en"
 *     responses:
 *       200:
 *         description: Successfully fetched CMS pages
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
 *                       title:
 *                         type: string
 *                         example: "CMS Page Title"
 *                       content:
 *                         type: string
 *                         example: "CMS Page Content"
 *       400:
 *         description: No CMS pages found for the given language
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
 *                   example: "Not found"
 *       500:
 *         description: Error occurred while fetching CMS pages
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
 * /api/faq:
 *   get:
 *     summary: Get FAQs with their categories
 *     description: Fetches FAQs grouped by their category, including category details.
 *     responses:
 *       200:
 *         description: Successfully fetched FAQs with categories
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
 *                   example: "Fetched successfully."
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       categoryName:
 *                         type: string
 *                         example: "General"
 *                       categoryDetails:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             question:
 *                               type: string
 *                               example: "What is your refund policy?"
 *                             answer:
 *                               type: string
 *                               example: "We offer a full refund within 30 days."
 *       500:
 *         description: Error occurred while fetching FAQs with categories
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
 *                   example: "Something went wrong."
 */


/**
 * @swagger
 * /api/getSptCat:
 *   get:
 *     summary: Get active support categories
 *     description: Fetches a list of active support categories with only their names.
 *     responses:
 *       200:
 *         description: Successfully fetched active support categories
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
 *                       categoryName:
 *                         type: string
 *                         example: "Technical Support"
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
 *                 errors:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: string
 *                       example: "Error on server"
 */



/**
 * @swagger
 * /api/ticket:
 *   get:
 *     summary: Get a list of tickets for a user
 *     description: Fetches a list of tickets raised by the current logged-in user, along with category and admin details.
 *     responses:
 *       200:
 *         description: Successfully fetched user ticket list
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
 *                     ticketList:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60c72b2f9f1b2c001f1b2b2c"
 *                           categoryName:
 *                             type: string
 *                             example: "Technical Support"
 *                           ticketId:
 *                             type: string
 *                             example: "TICKET12345"
 *                           status:
 *                             type: string
 *                             example: "open"
 *                           createdAt:
 *                             type: string
 *                             example: "2024-11-01T12:00:00Z"
 *       400:
 *         description: No data found
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
 *                   example: "NO_DATA"
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
 *                   example: "Error on server"
 */

/**
 * @swagger
 * /api/ticket:
 *   post:
 *     summary: User reply to a ticket
 *     description: Allows the user to reply to a ticket with a message and optional attachment.
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Reply data
 *         schema:
 *           type: object
 *           required:
 *             - ticketId
 *             - receiverId
 *             - message
 *           properties:
 *             ticketId:
 *               type: string
 *               example: "60c72b2f9f1b2c001f1b2b2c"
 *             receiverId:
 *               type: string
 *               example: "60c72b2f9f1b2c001f1b2b2d"
 *             message:
 *               type: string
 *               example: "I have additional details for the issue."
 *     responses:
 *       200:
 *         description: Successfully replied to the ticket
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
 *                   example: "Successfully reply the message"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       senderId:
 *                         type: string
 *                         example: "60c72b2f9f1b2c001f1b2b2c"
 *                       receiverId:
 *                         type: string
 *                         example: "60c72b2f9f1b2c001f1b2b2d"
 *                       message:
 *                         type: string
 *                         example: "I have additional details for the issue."
 *                       attachment:
 *                         type: string
 *                         example: "attachment.jpg"
 *       400:
 *         description: No records found
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
 *                   example: "No records"
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
 *                   example: "Something went wrong"
 */

/**
 * @swagger
 * /api/ticket:
 *   post:
 *     summary: Create a new support ticket
 *     description: Allows the user to create a new support ticket and notify the admin and user via email.
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Ticket data
 *         schema:
 *           type: object
 *           required:
 *             - categoryId
 *             - message
 *           properties:
 *             categoryId:
 *               type: string
 *               example: "60c72b2f9f1b2c001f1b2b2e"
 *             message:
 *               type: string
 *               example: "I need help with my account."
 *             roomid:
 *               type: string
 *               example: "room123"
 *     responses:
 *       200:
 *         description: Ticket raised successfully
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
 *                   example: "Ticket raised successfully"
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
 *                   example: "Error on server"
 */

/**
 * @swagger
 * /api/ticket:
 *   post:
 *     summary: Close a support ticket
 *     description: Allows the user to close a support ticket.
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Ticket close data
 *         schema:
 *           type: object
 *           required:
 *             - ticketId
 *           properties:
 *             ticketId:
 *               type: string
 *               example: "60c72b2f9f1b2c001f1b2b2c"
 *     responses:
 *       200:
 *         description: Ticket closed successfully
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
 *                   example: "Ticket closed successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "closed"
 *       400:
 *         description: No data found
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
 *                   example: "NO_DATA"
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
 *                   example: "SOMETHING_WRONG"
 */


/**
 * @swagger
 * /api/newsLetter/subscribe:
 *   post:
 *     summary: Subscribe to the newsletter
 *     description: Allows a user to subscribe to the newsletter by providing their email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user subscribing to the newsletter.
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Newsletter subscription successful
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
 *                   example: Newsletter Subscribe Successfully
 *       400:
 *         description: Invalid input or email already subscribed
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
 *                   example: Email already Subscribed
 *       500:
 *         description: Internal server error
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
 * /api/depositwebhook:
 *   post:
 *     summary: Handles deposit webhook
 *     description: Processes a deposit request, validates the payment status, and updates the user's wallet balance.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: The payment status (e.g., '100' for successful payment).
 *                 example: '100'
 *               currency:
 *                 type: string
 *                 description: The cryptocurrency symbol (e.g., 'BTC', 'ETH').
 *                 example: 'BTC'
 *               address:
 *                 type: string
 *                 description: The wallet address associated with the deposit.
 *                 example: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
 *               txn_id:
 *                 type: string
 *                 description: The transaction ID of the deposit.
 *                 example: 'abc123xyz'
 *               amount:
 *                 type: string
 *                 description: The amount of cryptocurrency being deposited.
 *                 example: '0.01'
 *               fee:
 *                 type: string
 *                 description: The fee associated with the transaction.
 *                 example: '0.0001'
 *               dest_tag:
 *                 type: string
 *                 description: The destination tag, specific to certain currencies like XRP.
 *                 example: '123456789'
 *     responses:
 *       200:
 *         description: Deposit processed and wallet updated successfully.
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
 *         description: Invalid request or payment status pending.
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
 *                   example: 
 *                     - "Invalid currency"
 *                     - "Payment status pending"
 *                     - "Payment already exists"
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
 *                   example: "Error on server"
 */


/**
 * @swagger
 * /api/checkEmail:
 *   get:
 *     summary: Retrieves the user details based on the current authenticated user
 *     description: Returns the user details of the currently authenticated user.
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
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
 *                   description: The user details object.
 *                   example: { "_id": "12345", "email": "user@example.com", "name": "John Doe" }
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
 *                   example: "error on server"
 */


