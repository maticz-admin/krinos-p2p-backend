/**
 * @swagger
 * /api/kyc:
 *   post:
 *     tags:
 *       - kyc
 *     summary: Upload KYC documents
 *     description: Uploads KYC documents such as front image, back image, selfie image, and address proof.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: frontImage
 *         type: file
 *         required: true
 *         description: Front side of the document image
 *       - in: formData
 *         name: backImage
 *         type: file
 *         required: true
 *         description: Back side of the document image
 *       - in: formData
 *         name: selfiImage
 *         type: file
 *         required: true
 *         description: Selfie image for verification
 *       - in: formData
 *         name: frontImageAddress
 *         type: file
 *         required: false
 *         description: Front image of address proof
 *     responses:
 *       200:
 *         description: Upload successful
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
 *                   example: "Documents uploaded successfully"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /kyc/upload:
 *   post:
 *     tags:
 *       - kyc
 *     summary: Upload ID documents
 *     description: Uploads ID documents such as front image, back image, selfie image, and PAN card.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: frontImage
 *         type: file
 *         required: true
 *         description: Front side of the ID document
 *       - in: formData
 *         name: backImage
 *         type: file
 *         required: true
 *         description: Back side of the ID document
 *       - in: formData
 *         name: selfiImage
 *         type: file
 *         required: true
 *         description: Selfie image for ID verification
 *       - in: formData
 *         name: panImage
 *         type: file
 *         required: true
 *         description: PAN card image
 *     responses:
 *       200:
 *         description: Upload successful
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
 *                   example: "ID documents uploaded successfully"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /api/kyc/create:
 *   post:
 *     summary: Create user KYC
 *     description: Create a new KYC record for a specific user.
 *     tags:
 *       - kyc
 *     parameters:
 *       - in: body
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: KYC record created successfully
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
 *                   example: "KYC record created successfully"
 */


/**
 * @swagger
 * /api/kycdetail:
 *   get:
 *     summary: Get user KYC details
 *     description: Retrieve the KYC details of a specific user.
 *     tags:
 *       - kyc
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: Successfully fetched KYC details
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
 *                     idProof:
 *                       type: string
 *                     addressProof:
 *                       type: string
 *       500:
 *         description: Something went wrong
 */


/**
 * @swagger
 * /api/kyc/idproof:
 *   put:
 *     summary: Update user ID proof
 *     description: Update ID proof information for a specific user's KYC.
 *     tags:
 *       - kyc
 *     parameters:
 *       - in: formData
 *         name: type
 *         schema:
 *           type: string
 *         required: true
 *         description: Type of ID proof
 *       - in: formData
 *         name: proofNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: Proof number
 *       - in: formData
 *         name: frontImage
 *         type: file
 *         required: true
 *         description: Front image of ID proof
 *       - in: formData
 *         name: selfiImage
 *         type: file
 *         required: true
 *         description: Selfie with ID proof
 *       - in: formData
 *         name: panImage
 *         type: file
 *         required: true
 *         description: PAN image of ID proof
 *       - in: formData
 *         name: backImage
 *         type: file
 *         required: false
 *         description: Back image of ID proof (if applicable)
 *     responses:
 *       200:
 *         description: ID proof uploaded successfully
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
 *                   example: "IDENTITY_DOC_UPLOAD_SUCCESS"
 *                 result:
 *                   type: object
 *                   properties:
 *                     idProof:
 *                       type: object
 *                       description: ID proof details
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Something went wrong
 */


/**
 * @swagger
 * /api/kyc/addressproof:
 *   post:
 *     summary: Update the address proof for a user
 *     tags: [KYC]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of address proof.
 *               frontImage:
 *                 type: string
 *                 format: binary
 *                 description: Front image of the address proof document.
 *     responses:
 *       200:
 *         description: Address proof updated successfully.
 *       409:
 *         description: No data found for the user.
 *       500:
 *         description: Server error.
 */


/**
 * @swagger
 * /getAllUserKyc:
 *   get:
 *     summary: Retrieve all user KYC details
 *     tags: [KYC]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page.
 *     responses:
 *       200:
 *         description: Successfully retrieved KYC details.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /approveUserKyc:
 *   post:
 *     summary: Approve user KYC document
 *     tags: [KYC]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user whose KYC is being approved
 *               formType:
 *                 type: string
 *                 description: Type of form to approve (either "idProof" or "addressProof")
 *                 enum: [idProof, addressProof]
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
 *                   example: "KYC document approved successfully"
 *       400:
 *         description: Bad request - Invalid type or other validation errors
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
 *                   example: "Something went wrong"
 */


/**
 * @swagger
 * /rejectUserKyc:
 *   post:
 *     summary: Reject user KYC document
 *     tags: [KYC]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user whose KYC is being rejected
 *               formType:
 *                 type: string
 *                 description: Type of form to reject (either "idProof" or "addressProof")
 *                 enum: [idProof, addressProof]
 *               reason:
 *                 type: string
 *                 description: Reason for rejecting the KYC document
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
 *                   example: "KYC document rejected successfully"
 *       400:
 *         description: Bad request - Invalid type or other validation errors
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
 *                   example: "Something went wrong"
 */



