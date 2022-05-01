const express = require('express');
const router = express.Router();
const channelsController = require('../controllers/channels.controller');
const { requireAuth } = require('../middlewares/verifyToken.middleware');

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Returns the list of all the books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: The list of the books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */

router.get('/videos', requireAuth, channelsController.getAllChannelVideos);

router.get('/author/:authorId/videos', channelsController.getAllChannelPublicVideos);

router.get('/:id/info', channelsController.getChannelPublicInformation);

module.exports = router;