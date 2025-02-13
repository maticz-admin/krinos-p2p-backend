/**
 * @swagger
 * /api/getHideoZeroStatus:
 *   get:
 *     summary: Retrieve the user's "hideZeroStatus" setting
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []  # Indicates that the endpoint requires a bearer token
 *     responses:
 *       200:
 *         description: Successfully retrieved the "hideZeroStatus" setting
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 hideZeroStatus:
 *                   type: boolean
 *                   description: Indicates whether the user has set to hide zero balance wallets
 *                   example: false
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
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */


