/**
 * @swagger
 * /api/p2pcreateorder:
 *   get:
 *     tags:
 *       - p2p users
 *     summary: Get user P2P create order
 *     description: Retrieve P2P orders created by a specific user with pagination.
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user
 *       - in: query
 *         name: buyorsell
 *         schema:
 *           type: string
 *         required: false
 *         description: Type of order (buy or sell)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of records per page
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
 *                       currencyvalue:
 *                         type: number
 *                         description: Calculated currency value
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                     description: Array of user orders
 *                 count:
 *                   type: integer
 *                   description: Total count of orders
 */

/**
 * @swagger
 * /api/p2pviewoffer:
 *   get:
 *     tags:
 *       - p2p users
 *     summary: Get user P2P view offer
 *     description: Retrieve P2P view offers by a specific user with pagination.
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of records per page
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
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                     description: Array of user offers
 *                 count:
 *                   type: integer
 *                   description: Total count of offers
 */
