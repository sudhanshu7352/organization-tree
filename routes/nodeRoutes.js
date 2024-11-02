const express = require('express');
const nodeController = require('../controllers/nodeController');

const router = express.Router();

router.post('/nodes', nodeController.createNode);
router.put('/nodes/:nodeId', nodeController.updateNode);
router.delete('/nodes/:nodeId', nodeController.deleteNode);
router.get('/nodes/tree', nodeController.getTree);

module.exports = router;
