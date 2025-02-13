/**
 * @swagger
 * /p2papi/create-p2p-orders:
 *   post:
 *     summary: Create a new P2P order
 *     description: Allows a user to create a P2P order with specified parameters.
 *     tags: 
 *       - P2P Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               createdata:
 *                 type: object
 *                 description: Order creation data
 *                 properties:
 *                   createrid:
 *                     type: string
 *                     description: ID of the order creator
 *                     example: "12345"
 *                   coin:
 *                     type: string
 *                     description: Cryptocurrency symbol (e.g., BTC)
 *                     example: "BTC"
 *                   preferedcurrency:
 *                     type: string
 *                     description: Preferred currency (e.g., USD)
 *                     example: "USD"
 *                   offermargin:
 *                     type: number
 *                     description: Margin percentage for the offer
 *                     example: 5.0
 *                   fixedmarketrate:
 *                     type: string
 *                     description: Fixed market rate (optional)
 *                     example: "0"
 *                   max:
 *                     type: number
 *                     description: Maximum amount for the trade
 *                     example: 1000
 *                   ordertype:
 *                     type: string
 *                     description: Order type - either "Buy" or "Sell"
 *                     example: "Sell"
 *     responses:
 *       200:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   description: The created order data
 *                 value:
 *                   type: number
 *                   description: Calculated received value
 *                   example: 0.12345678
 *                 coin:
 *                   type: string
 *                   description: Coin used in the order
 *                   example: "BTC"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: "failed"
 *                 message:
 *                   type: string
 *                   example: "Error found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: "failed"
 *                 message:
 *                   type: string
 *                   example: "Error found"
 */


/**
 * @swagger
 * /p2papi/filter-p2p-orders:
 *   post:
 *     summary: Filter P2P Orders
 *     description: Filter P2P orders based on various criteria such as coin type, preferred currency, order type, amount, and payment method.
 *     tags:
 *       - P2P Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coin:
 *                 type: string
 *                 description: The coin type (e.g., BTC, ETH)
 *               prefferedcurrency:
 *                 type: string
 *                 description: The preferred currency (e.g., USD, EUR)
 *               ordertype:
 *                 type: string
 *                 description: Type of order (Sell or Buy)
 *               amount:
 *                 type: number
 *                 description: The amount for filtering orders
 *               paymentmethod:
 *                 type: string
 *                 description: The payment method
 *               skip:
 *                 type: integer
 *                 description: Number of records to skip for pagination
 *               limit:
 *                 type: integer
 *                 description: Number of records to limit for pagination
 *     responses:
 *       200:
 *         description: Success
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
 *                       coin:
 *                         type: string
 *                       prefferedcurrency:
 *                         type: string
 *                       currentmarketvalue:
 *                         type: number
 *                       prefferedcurrencyvalue:
 *                         type: number
 *                       variablepercentage:
 *                         type: number
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /p2papi/get-coinlist:
 *   get:
 *     summary: Get a list of active coins
 *     description: Retrieve a list of active coins from the database.
 *     tags:
 *       - Coins
 *     parameters:
 *       - in: query
 *         name: userid
 *         schema:
 *           type: string
 *         required: false
 *         description: ID of the user to update their last seen
 *     responses:
 *       200:
 *         description: A list of active coins
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
 *                       _id:
 *                         type: string
 *                         description: Unique identifier for the coin
 *                       name:
 *                         type: string
 *                         description: Name of the coin
 *                       symbol:
 *                         type: string
 *                         description: Symbol of the coin
 *                       status:
 *                         type: string
 *                         description: Status of the coin (e.g., active)
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /p2papi/preferred-currencies:
 *   get:
 *     summary: Get a list of active preferred currencies
 *     description: Retrieve a list of active currencies marked as preferred from the database.
 *     tags:
 *       - Currencies
 *     parameters:
 *       - in: query
 *         name: userid
 *         schema:
 *           type: string
 *         required: false
 *         description: ID of the user to update their last seen
 *     responses:
 *       200:
 *         description: A list of active preferred currencies
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
 *                       _id:
 *                         type: string
 *                         description: Unique identifier for the currency
 *                       name:
 *                         type: string
 *                         description: Name of the currency
 *                       symbol:
 *                         type: string
 *                         description: Symbol of the currency
 *                       status:
 *                         type: string
 *                         description: Status of the currency (e.g., active)
 *       500:
 *         description: Internal server error
 */

  
/**
 * @swagger
 * /p2papi/get-offettag:
 *   get:
 *     summary: Get a list of all active offer tags
 *     description: Retrieve a list of offer tags with active status from the database.
 *     tags:
 *       - Offer Tags
 *     parameters:
 *       - in: query
 *         name: userid
 *         schema:
 *           type: string
 *         required: false
 *         description: ID of the user to update their last seen
 *     responses:
 *       200:
 *         description: A list of active offer tags
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
 *                       _id:
 *                         type: string
 *                         description: Unique identifier for the offer tag
 *                       name:
 *                         type: string
 *                         description: Name of the offer tag
 *                       status:
 *                         type: boolean
 *                         description: Status of the offer tag (e.g., true for active)
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /p2papi/updateofferviews:
 *   post:
 *     summary: Update the views count for a specific offer
 *     description: Increments the view count of an offer specified by order ID.
 *     tags:
 *       - Offers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Order ID of the offer
 *               userid:
 *                 type: string
 *                 description: User ID of the person updating the view count
 *     responses:
 *       200:
 *         description: Successfully updated view count
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
 *                   description: The updated offer document
 *       404:
 *         description: Offer not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /p2papi/getsingleuser:
 *   get:
 *     summary: Get user details along with KYC and wallet information
 *     description: Retrieve user data, including KYC and wallet information, for a specific user.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: userid
 *         required: false
 *         description: The user ID to fetch the details for. If not provided, the authenticated user's ID will be used.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved user data
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
 *                   description: The user details
 *                 kyc:
 *                   type: object
 *                   description: KYC details of the user (can be null)
 *                 wallet:
 *                   type: object
 *                   description: Wallet details of the user (can be null)
 *       400:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

  
/**
 * @swagger
 * /p2papi/cancel-trade:
 *   post:
 *     summary: Cancel a trade by marking the chat as inactive
 *     description: This endpoint marks an active trade's chat as "Inactive" and updates the order's end time.
 *     tags:
 *       - Trades
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the order chat to be canceled
 *               userid:
 *                 type: string
 *                 description: The ID of the user who is canceling the trade
 *     responses:
 *       200:
 *         description: Successfully cancelled the trade
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
 *                   description: The updated order chat data
 *       400:
 *         description: Missing order ID or user ID
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */

  
/**
 * @swagger
 * /p2papi/adduser-review:
 *   post:
 *     summary: Add a review for a user
 *     description: This endpoint allows you to add a review for a user and sends a notification to the user.
 *     tags:
 *       - Reviews
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               owner:
 *                 type: string
 *                 description: The user ID of the user who is receiving the review
 *               review:
 *                 type: object
 *                 description: The review data to be added
 *               userid:
 *                 type: string
 *                 description: The user ID of the user adding the review
 *     responses:
 *       200:
 *         description: Successfully added the review
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
 *                   description: The updated user data with the added review
 *       400:
 *         description: Missing owner, review, or user ID in the request body
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /p2papi/createroom:
 *   post:
 *     summary: Create or activate a room for a trade order
 *     description: This endpoint creates a new chat room or activates an existing one for a trade order.
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               creater:
 *                 type: string
 *                 description: The user ID of the order creator
 *               spender:
 *                 type: string
 *                 description: The user ID of the spender
 *               orderid:
 *                 type: string
 *                 description: The unique ID of the order
 *               roomid:
 *                 type: string
 *                 description: The unique ID of the chat room
 *               updatedata:
 *                 type: object
 *                 description: The updated data for the trade
 *     responses:
 *       200:
 *         description: Successfully created or activated the trade room
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
 *                   description: The newly created chat room data
 *       400:
 *         description: Missing required fields in the request body
 *       404:
 *         description: Order not found or user not found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /p2papi/createroom:
 *   get:
 *     summary: Retrieve a specific trade chat based on roomid and userid
 *     description: This endpoint fetches the details of a trade chat, including the order creator's info and the trade data, for a given roomid and userid.
 *     tags:
 *       - Trade Chat
 *     parameters:
 *       - name: roomid
 *         in: query
 *         description: The unique ID of the chat room.
 *         required: true
 *         schema:
 *           type: string
 *       - name: userid
 *         in: query
 *         description: The unique ID of the user requesting the trade chat details.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the trade chat data.
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
 *                       roomid:
 *                         type: string
 *                         description: The ID of the chat room.
 *                       ordercreator:
 *                         type: string
 *                         description: The user ID of the order creator.
 *                       owner:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             userId:
 *                               type: string
 *                             firstName:
 *                               type: string
 *                             lastName:
 *                               type: string
 *                             email:
 *                               type: string
 *                         description: Information about the order creator.
 *                       tradedata:
 *                         type: object
 *                         properties:
 *                           orderid:
 *                             type: string
 *                             description: The order ID associated with the trade.
 *                           offertimelimit:
 *                             type: integer
 *                             description: The time limit for the offer in minutes.
 *                         description: Details about the trade data.
 *       400:
 *         description: Missing required query parameters (roomid or userid).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: roomid and userid are required
 *       500:
 *         description: Internal server error while retrieving the trade chat.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: Error found
 */


/**
 * @swagger
 * /p2papi/getsingletradechat:
 *   get:
 *     summary: Retrieve a specific trade chat based on roomid and userid
 *     description: This endpoint fetches the details of a trade chat, including the order creator's information and trade data, for a given roomid and userid.
 *     tags:
 *       - Trade Chat
 *     parameters:
 *       - name: roomid
 *         in: query
 *         description: The unique ID of the chat room to fetch the trade chat for.
 *         required: true
 *         schema:
 *           type: string
 *       - name: userid
 *         in: query
 *         description: The unique ID of the user requesting the trade chat details.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the trade chat data.
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
 *                       roomid:
 *                         type: string
 *                         description: The ID of the chat room.
 *                       ordercreator:
 *                         type: string
 *                         description: The user ID of the order creator.
 *                       owner:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             userId:
 *                               type: string
 *                             firstName:
 *                               type: string
 *                             lastName:
 *                               type: string
 *                             email:
 *                               type: string
 *                         description: Information about the order creator.
 *                       tradedata:
 *                         type: object
 *                         properties:
 *                           orderid:
 *                             type: string
 *                             description: The order ID associated with the trade.
 *                           offertimelimit:
 *                             type: integer
 *                             description: The time limit for the offer in minutes.
 *                         description: Details about the trade data.
 *       400:
 *         description: Missing required query parameters (roomid or userid).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: roomid and userid are required
 *       500:
 *         description: Internal server error while retrieving the trade chat.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: Error found
 */


/**
 * @swagger
 * /p2papi/user-offer:
 *   get:
 *     summary: Retrieve all orders created by a specific user
 *     description: This endpoint returns a list of all orders created by the user specified by the `userid` query parameter.
 *     tags:
 *       - User Offers
 *     parameters:
 *       - name: userid
 *         in: query
 *         description: The unique ID of the user whose offers (orders) are being retrieved.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's offers.
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
 *                       roomid:
 *                         type: string
 *                         description: The ID of the chat room.
 *                       ordercreator:
 *                         type: string
 *                         description: The user ID of the order creator.
 *                       orderid:
 *                         type: string
 *                         description: The order ID associated with the offer.
 *                       offerstatus:
 *                         type: string
 *                         description: The current status of the offer.
 *       400:
 *         description: Missing `userid` query parameter.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: userid is required
 *       500:
 *         description: Internal server error while retrieving the user's offers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: Error found
 */


/**
 * @swagger
 * /p2papi/get-singlesaledetail:
 *   get:
 *     summary: Retrieve the details of a single sale based on the sale ID
 *     description: This endpoint returns the details of a sale along with market values and currency conversion calculations for the sale.
 *     tags:
 *       - Sales
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The unique ID of the sale to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *       - name: userid
 *         in: query
 *         description: The user ID of the person making the request.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the sale details with the calculated currency values.
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
 *                   description: The details of the sale.
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The ID of the sale.
 *                     preferedcurrency:
 *                       type: string
 *                       description: The preferred currency for the sale.
 *                     coin:
 *                       type: string
 *                       description: The coin being sold.
 *                     offermargin:
 *                       type: string
 *                       description: The margin applied to the offer.
 *                     fixedmarketrate:
 *                       type: number
 *                       description: The fixed market rate for the coin.
 *                 prefferedcurrencyvalue:
 *                   type: number
 *                   description: The preferred currency value calculated based on the market rate.
 *                 currentmarketvalue:
 *                   type: number
 *                   description: The current market value of the coin in the preferred currency.
 *                 variablepercentage:
 *                   type: number
 *                   description: The percentage change in value based on the margin.
 *       400:
 *         description: Missing required query parameters (`id`, `userid`).
 *       500:
 *         description: Internal server error while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: Error found
 */


/**
 * @swagger
 * /p2papi/update-order-status:
 *   post:
 *     summary: Update the order status (paid, confirm, reject) and send notifications.
 *     description: This endpoint allows updating the status of an order (paid, confirm, reject) and sends relevant notifications to the user.
 *     tags:
 *       - Order Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The unique ID of the order chat.
 *               status:
 *                 type: string
 *                 description: The status to update to (paid, confirm, reject).
 *               userid:
 *                 type: string
 *                 description: The user ID of the person making the request.
 *     responses:
 *       200:
 *         description: Successfully updated the order status and sent notifications.
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
 *                   description: Updated order status details.
 *       400:
 *         description: Missing or invalid parameters.
 *       500:
 *         description: Internal server error while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: Error found
 */


/**
 * @swagger
 * /p2papi/get-currency-data:
 *   get:
 *     summary: Retrieve currency data based on the symbol.
 *     description: This endpoint returns the currency data for a given symbol (e.g., BTC, ETH).
 *     tags:
 *       - Currency
 *     parameters:
 *       - name: symbol
 *         in: query
 *         description: The symbol of the currency to retrieve data for (e.g., BTC, ETH).
 *         required: true
 *         schema:
 *           type: string
 *       - name: userid
 *         in: query
 *         description: The user ID of the person making the request.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved currency data.
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
 *                   description: Currency data based on the symbol.
 *       400:
 *         description: Missing or invalid parameters.
 *       500:
 *         description: Internal server error while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: Error found
 */


/**
 * @swagger
 * /p2papi/assetupdate:
 *   post:
 *     summary: Update admin and user assets after asset changes.
 *     description: This endpoint updates the assets for the admin, owner, and spender after asset balance changes and triggers socket events for refresh.
 *     tags:
 *       - Admin Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coin:
 *                 type: string
 *                 description: The coin to update (e.g., BTC, ETH).
 *               adminbalance:
 *                 type: number
 *                 description: The new balance of the admin.
 *               ownerid:
 *                 type: string
 *                 description: The user ID of the owner whose asset will be updated.
 *               ownerbalance:
 *                 type: number
 *                 description: The new balance of the owner.
 *               spenderid:
 *                 type: string
 *                 description: The user ID of the spender whose asset will be updated.
 *               spenderbalance:
 *                 type: number
 *                 description: The new balance of the spender.
 *               roomid:
 *                 type: string
 *                 description: The room ID for triggering the socket event.
 *               userid:
 *                 type: string
 *                 description: The user ID of the person making the request.
 *     responses:
 *       200:
 *         description: Successfully updated assets and triggered refresh event.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: string
 *                   example: Successfully updated assets
 *       400:
 *         description: Missing or invalid parameters.
 *       500:
 *         description: Internal server error while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: Error found
 */


/**
 * @swagger
 * /p2papi/lastseen:
 *   post:
 *     summary: Update the user's last seen timestamp.
 *     description: This endpoint updates the last seen timestamp for a specific user.
 *     tags:
 *       - User Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userid:
 *                 type: string
 *                 description: The unique user ID of the user whose last seen timestamp is to be updated.
 *               status:
 *                 type: string
 *                 description: The online/offline status of the user.
 *     responses:
 *       200:
 *         description: Successfully updated the last seen timestamp.
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
 *                   description: Updated user data with the last seen timestamp.
 *       400:
 *         description: Missing or invalid parameters.
 *       500:
 *         description: Internal server error while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: Error found
 */


/**
 * @swagger
 * /p2papi//update-user-status:
 *   post:
 *     summary: Update the user's online status.
 *     description: This endpoint allows updating the user's online status, indicating whether the user is online or offline.
 *     tags:
 *       - User Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userid:
 *                 type: string
 *                 description: The unique user ID of the user whose status is to be updated.
 *               status:
 *                 type: string
 *                 description: The user's status (e.g., 'online', 'offline').
 *     responses:
 *       200:
 *         description: Successfully updated the user's online status.
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
 *                   description: The updated user object with status.
 *       400:
 *         description: Missing or invalid parameters.
 *       500:
 *         description: Internal server error while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: Error found
 */


/**
 * @swagger
 * /p2papi/get-cms:
 *   get:
 *     summary: Retrieve active CMS data by identifier.
 *     description: This endpoint retrieves content from the CMS based on a given identifier.
 *     tags:
 *       - CMS
 *     parameters:
 *       - name: identifier
 *         in: query
 *         description: The identifier for the CMS content to retrieve (e.g., 'home', 'about').
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved CMS data.
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
 *                   description: The CMS content corresponding to the identifier.
 *       400:
 *         description: Missing or invalid parameters.
 *       500:
 *         description: Internal server error while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: Error found
 */


/**
 * @swagger
 * /p2papi/get-faq:
 *   get:
 *     summary: Retrieve all active FAQ entries.
 *     description: This endpoint retrieves all active FAQ entries from the database.
 *     tags:
 *       - FAQ
 *     responses:
 *       200:
 *         description: Successfully retrieved the active FAQ entries.
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
 *                     description: FAQ entry details.
 *       500:
 *         description: Internal server error while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: Error found
 */


/**
 * @swagger
 * /p2papi/get-sitesettings:
 *   get:
 *     summary: Retrieve the site settings.
 *     description: This endpoint retrieves the general settings for the site.
 *     tags:
 *       - Site Settings
 *     responses:
 *       200:
 *         description: Successfully retrieved the site settings.
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
 *                   description: The site settings.
 *       500:
 *         description: Internal server error while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: Error found
 */


/**
 * @swagger
 * /p2papi/get-tradehistory:
 *   get:
 *     summary: Get trade history for a user
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - name: userId
 *         in: query
 *         description: User ID to filter trade history
 *         required: true
 *         schema:
 *           type: string
 *           example: "12345"
 *     responses:
 *       200:
 *         description: Successfully fetched trade history
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
 *                       orderid:
 *                         type: string
 *                         example: "12345"
 *                       creater:
 *                         type: string
 *                         example: "creator123"
 *                       spender:
 *                         type: string
 *                         example: "spender123"
 *                 count:
 *                   type: integer
 *                   example: 100
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /p2papi/get-your-request:
 *   get:
 *     summary: Get spender history for a user
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - name: userId
 *         in: query
 *         description: User ID to filter spender history
 *         required: true
 *         schema:
 *           type: string
 *           example: "12345"
 *     responses:
 *       200:
 *         description: Successfully fetched spender history
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
 *                       orderid:
 *                         type: string
 *                         example: "12345"
 *                       spender:
 *                         type: string
 *                         example: "spender123"
 *                 count:
 *                   type: integer
 *                   example: 100
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /p2papi/get-user-balance:
 *   get:
 *     summary: Get the total balance of a user
 *     parameters:
 *       - name: userId
 *         in: query
 *         description: User ID to get total balance
 *         required: true
 *         schema:
 *           type: string
 *           example: "12345"
 *     responses:
 *       200:
 *         description: Successfully fetched user balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: number
 *                   example: 500.75
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /p2papi/get-trade-speed:
 *   get:
 *     summary: Get the average trade speed for a user
 *     parameters:
 *       - name: userId
 *         in: query
 *         description: User ID to calculate trade speed
 *         required: true
 *         schema:
 *           type: string
 *           example: "12345"
 *     responses:
 *       200:
 *         description: Successfully calculated trade speed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: number
 *                   example: 30.5
 *       500:
 *         description: Internal server error
 */


/**
 * 
 * @swagger
 * /p2papi/update-profile-pic:
 *   post:
 *     summary: Upload user profile picture
 *     description: Uploads and updates the user profile picture.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: User profile image
 *       - in: body
 *         name: userId
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Successfully uploaded and updated profile picture
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /p2papi/update-profile-pic:
 *   post:
 *     summary: Update user profile picture in database
 *     description: After the image is uploaded, update the user's profile image in the database.
 *     parameters:
 *       - in: body
 *         name: userid
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Profile image updated successfully
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /p2papi/cancel-offer:
 *   post:
 *     summary: Cancel a peer-to-peer offer
 *     description: Cancels an active peer-to-peer offer by setting its status to 'ended'.
 *     parameters:
 *       - in: body
 *         name: orderid
 *         required: true
 *         description: The order ID of the offer
 *     responses:
 *       200:
 *         description: Offer successfully canceled
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /p2papi/get-paymenttypes:
 *   get:
 *     summary: Get active payment methods
 *     description: Retrieves the active payment methods from the system.
 *     responses:
 *       200:
 *         description: List of active payment methods
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /p2papi/create-addresss:
 *   post:
 *     summary: Create a new cryptocurrency address
 *     description: Creates a new crypto address for the specified cryptocurrency.
 *     parameters:
 *       - in: body
 *         name: symbol
 *         required: true
 *         description: Cryptocurrency symbol (e.g., BTC, ETH)
 *       - in: body
 *         name: email
 *         required: true
 *         description: User email
 *     responses:
 *       200:
 *         description: Crypto address successfully created
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /p2papi/check-deposit:
 *   post:
 *     summary: Check for new deposits
 *     description: Checks and processes any new deposits for the user, updating balances and recording transactions.
 *     responses:
 *       200:
 *         description: Successfully checked for deposits
 *       500:
 *         description: Internal server error
 */