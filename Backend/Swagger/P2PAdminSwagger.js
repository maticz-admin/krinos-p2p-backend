/**
 * @swagger
 * /p2papiadmin/add-offertag:
 *   post:
 *     summary: Adds a new offer tag.
 *     tags:
 *       - Offer Tags
 *     description: Creates a new offer tag with a name and description.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the offer tag.
 *                 example: "Special Offer"
 *               description:
 *                 type: string
 *                 description: A description of the offer tag.
 *                 example: "A special offer for new users."
 *     responses:
 *       200:
 *         description: Offer tag created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "created successfully"
 *       400:
 *         description: Invalid input or validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "failed"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Name is required."
 *                     description:
 *                       type: string
 *                       example: "Description is required."
 *                 message:
 *                   type: string
 *                   example: "Invalid inputs"
 */

/**
 * @swagger
 * /p2papiadmin/edit-offertag:
 *   put:
 *     summary: Edit an existing offer tag.
 *     tags:
 *       - Offer Tags
 *     description: Updates the details of an existing offer tag.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the offer tag to update.
 *         schema:
 *           type: string
 *           example: "603c72ef3b0e1b1c89e4f5d0"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the offer tag.
 *                 example: "Updated Special Offer"
 *               description:
 *                 type: string
 *                 description: The updated description of the offer tag.
 *                 example: "An updated special offer for new users."
 *               status:
 *                 type: string
 *                 description: The status of the offer tag (e.g., active, inactive).
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Offer tag updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Updated successfully"
 *       400:
 *         description: Invalid input or validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "failed"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Name is required."
 *                     description:
 *                       type: string
 *                       example: "Description is required."
 *                 message:
 *                   type: string
 *                   example: "Invalid inputs"
 *       404:
 *         description: Offer tag not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "failed"
 *                 message:
 *                   type: string
 *                   example: "Offer tag not found"
 */

/**
 * @swagger
 * /p2papiadmin/get-offertag:
 *   get:
 *     summary: Retrieve all offer tags with pagination.
 *     tags:
 *       - Offer Tags
 *     description: Retrieves all offer tags with pagination and optional search filter by name and description.
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: The page number for pagination.
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: The number of items per page for pagination.
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: search
 *         required: false
 *         description: Search term for filtering offer tags by name or description.
 *         schema:
 *           type: string
 *           example: "Special Offer"
 *     responses:
 *       200:
 *         description: List of offer tags retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "603c72ef3b0e1b1c89e4f5d0"
 *                       name:
 *                         type: string
 *                         example: "Special Offer"
 *                       description:
 *                         type: string
 *                         example: "A special offer for new users."
 *                       status:
 *                         type: string
 *                         example: "active"
 *                 count:
 *                   type: integer
 *                   example: 50
 *       400:
 *         description: Invalid query parameters or pagination error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "failed"
 *                 message:
 *                   type: string
 *                   example: "Invalid query parameters"
 */

/**
 * @swagger
 * /p2papiadmin/get-offer-history:
 *   get:
 *     summary: Retrieve offer history
 *     description: Get the offer history with pagination and export options for CSV, XLS, or PDF formats.
 *     tags:
 *       - Offer History
 *     parameters:
 *       - name: export
 *         in: query
 *         description: Format to export data. Supported values "csv", "xls", "pdf"
 *         required: false
 *         schema:
 *           type: string
 *           enum: 
 *             - "csv"
 *             - "xls"
 *             - "pdf"
 *       - name: firstName
 *         in: query
 *         description: Filter by user's first name
 *         required: false
 *         schema:
 *           type: string
 *       - name: email
 *         in: query
 *         description: Filter by user's email
 *         required: false
 *         schema:
 *           type: string
 *       - name: skip
 *         in: query
 *         description: Number of items to skip (for pagination)
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Number of items to retrieve (for pagination)
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully fetched offer history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       createdAt:
 *                         type: string
 *                         example: "2024-11-15T08:00:00Z"
 *                       createrid:
 *                         type: string
 *                         example: "creator123"
 *                       orderid:
 *                         type: string
 *                         example: "order456"
 *                       coin:
 *                         type: string
 *                         example: "BTC"
 *                       offertype:
 *                         type: string
 *                         example: "buy"
 *                       preferedcurrency:
 *                         type: string
 *                         example: "USD"
 *                       pricetype:
 *                         type: string
 *                         example: "fixed"
 *                       offertimelimit:
 *                         type: string
 *                         example: "1 hour"
 *                       min:
 *                         type: number
 *                         example: 0.1
 *                       max:
 *                         type: number
 *                         example: 10
 *                       offermargin:
 *                         type: string
 *                         example: "5%"
 *                 count:
 *                   type: integer
 *                   example: 100
 *       400:
 *         description: Bad request, invalid parameters or missing required fields.
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /p2papiadmin/get-trade-history:
 *   get:
 *     summary: Retrieve trade history
 *     description: Get the trade history with pagination and options to export data in CSV, XLS, or PDF formats.
 *     tags:
 *       - Trade History
 *     parameters:
 *       - name: orderid
 *         in: query
 *         description: Filter by order ID.
 *         required: false
 *         schema:
 *           type: string
 *       - name: coin
 *         in: query
 *         description: Filter by coin.
 *         required: false
 *         schema:
 *           type: string
 *       - name: preferedcurrency
 *         in: query
 *         description: Filter by preferred currency.
 *         required: false
 *         schema:
 *           type: string
 *       - name: export
 *         in: query
 *         description: Format to export data (CSV, XLS, PDF).
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["csv", "xls", "pdf"]
 *       - name: skip
 *         in: query
 *         description: Number of items to skip (for pagination).
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Number of items to retrieve (for pagination).
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved trade history.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       createdAt:
 *                         type: string
 *                         example: "2024-11-15T08:00:00Z"
 *                       orderid:
 *                         type: string
 *                         example: "order123"
 *                       receive:
 *                         type: number
 *                         example: 100.5
 *                       adminfee:
 *                         type: number
 *                         example: 1.5
 *                       pay:
 *                         type: number
 *                         example: 99
 *                       preferedcurrency:
 *                         type: string
 *                         example: "USD"
 *                       coin:
 *                         type: string
 *                         example: "BTC"
 *                       status:
 *                         type: string
 *                         example: "completed"
 *                 count:
 *                   type: integer
 *                   example: 50
 *       400:
 *         description: Invalid query parameters.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * tags:
 *   name: PaymentTypes
 *   description: API to manage payment types
 */

/**
 * @swagger
 * /p2papiadmin/get-paymenttypes:
 *   get:
 *     summary: Get payment types with pagination and filters
 *     tags:
 *       - payment
 *     parameters:
 *       - in: query
 *         name: Name
 *         description: Filter by name
 *         schema:
 *           type: string
 *       - in: query
 *         name: Description
 *         description: Filter by description
 *         schema:
 *           type: string
 *       - in: query
 *         name: skip
 *         description: Pagination skip
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         description: Pagination limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of payment types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Name:
 *                         type: string
 *                       label:
 *                         type: string
 *                       value:
 *                         type: string
 *       500:
 *         description: Internal server error
 * 
 */

/**
 * @swagger
 * /p2papiadmin/add-paymenttypes:
 *   post:
 *     summary: Add a new payment type
 *     tags:
 *       - payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the payment type
 *     responses:
 *       200:
 *         description: Payment type added successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /p2papiadmin/edit-paymenttypes:
 *   put:
 *     summary: Edit an existing payment type
 *     tags:
 *       - payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the payment type to edit
 *               name:
 *                 type: string
 *                 description: The new name of the payment type
 *               status:
 *                 type: string
 *                 description: The new status of the payment type
 *     responses:
 *       200:
 *         description: Payment type updated successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */


  
/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: API to manage wallets
 */

/**
 * @swagger
 * /p2papiadmin/getownerwallet:
 *   get:
 *     summary: Retrieve the wallet information
 *     tags: [Wallet]
 *     responses:
 *       200:
 *         description: Successfully retrieved wallet information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     privatekey:
 *                       type: string
 *                       example: "your-private-key"
 *                     walletaddress:
 *                       type: string
 *                       example: "your-wallet-address"
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /p2papiadmin/updatewallet:
 *   put:
 *     summary: Update the wallet address and private key
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               privatekey:
 *                 type: string
 *                 description: The private key of the wallet to update
 *                 example: "your-new-private-key"
 *     responses:
 *       200:
 *         description: Successfully updated the wallet information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     privatekey:
 *                       type: string
 *                       example: "your-new-private-key"
 *                     walletaddress:
 *                       type: string
 *                       example: "your-new-wallet-address"
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */

