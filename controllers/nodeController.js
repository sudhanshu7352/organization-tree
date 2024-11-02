const nodeService = require('../services/nodeService');

const createNode = async (req, res) => {
  try {
    const { nodeName, nodeType, parentId } = req.body;
    const newNode = await nodeService.createNode(nodeName, nodeType, parentId);
    res.status(201).json(newNode);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateNode = async (req, res) => {
  try {
    const { nodeName, parentId, shiftOption } = req.body;
    const { nodeId } = req.params;
    const updatedNode = await nodeService.updateNode(nodeId, nodeName, parentId, shiftOption);
    res.status(200).json(updatedNode);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteNode = async (req, res) => {
  try {
    const { shiftOption } = req.body;
    const { nodeId } = req.params;
    await nodeService.deleteNode(nodeId, shiftOption);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTree = async (req, res) => {
  try {
    const tree = await nodeService.getTree();
    res.status(200).json(tree);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createNode,
  updateNode,
  deleteNode,
  getTree,
};
