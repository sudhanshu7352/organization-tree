const { Node } = require('../models');
const { Op } = require('sequelize');

const colorPool = process.env.COLOR_POOL.split(',');

const getNextColor = (currentColorIndex) => {
  return colorPool[currentColorIndex % colorPool.length];
};

const createNode = async (nodeName, nodeType, parentId) => {
  let parent = null;

  if (parentId) {
    parent = await Node.findByPk(parentId);
    if (!parent) throw new Error('Parent node not found');

    // Check for cycles when adding the new node
    const cycleDetected =  await hasCycle(parent.nodeId, parentId)
    if (cycleDetected) throw new Error('Adding this node would create a cycle');
  }

  const currentColorIndex = await Node.count({ where: { nodeType } });
  const nodeColor = getNextColor(currentColorIndex);

  const newNode = await Node.create({
    nodeName,
    nodeType,
    nodeColor,
    parentId,
  });

  if (nodeType !== 'employee') {
    await propagateColor(newNode.nodeId, nodeColor);
  }

  return newNode;
};


const hasCycle = async (nodeId, parentId) => {
  let current = await Node.findByPk(parentId);
  while (current) {
    // If current node is the same as the node we want to insert, we have a cycle.
    if (current.nodeId === nodeId) {
      return true;
    }
    current = await Node.findByPk(current.parentId);
  }
  return false;
};

const propagateColor = async (nodeId, color) => {
  const children = await Node.findAll({ where: { parentId: nodeId } });
  for (const child of children) {
    child.nodeColor = color;
    await child.save();
    if (child.nodeType !== 'employee') {
      await propagateColor(child.nodeId, color);
    }
  }
};

const updateNode = async (nodeId, nodeName, newParentId, shiftOption) => {
  const node = await Node.findByPk(nodeId);
  if (!node) throw new Error('Node not found');

  node.nodeName = nodeName || node.nodeName;
  if (newParentId) {
    const newParent = await Node.findByPk(newParentId);
    if (!newParent) throw new Error('New parent node not found');

    if (shiftOption === 'move') {
      node.parentId = newParentId;
      await node.save();
    } else if (shiftOption === 'shift') {
      const children = await Node.findAll({ where: { parentId: nodeId } });
      for (const child of children) {
        child.parentId = newParentId;
        await child.save();
      }
      node.parentId = newParentId;
      await node.save();
    }
  } else {
    await node.save();
  }

  return node;
};

const deleteNode = async (nodeId, shiftOption) => {
  const node = await Node.findByPk(nodeId);
  if (!node) throw new Error('Node not found');

  if (shiftOption === 'remove') {
    await Node.destroy({ where: { [Op.or]: [{ nodeId }, { parentId: nodeId }] } });
  } else if (shiftOption === 'shift') {
    const children = await Node.findAll({ where: { parentId: nodeId } });
    for (const child of children) {
      child.parentId = node.parentId;
      await child.save();
    }
    await node.destroy();
  }

  return true;
};

const getTree = async () => {
  const nodes = await Node.findAll();
  const nodeMap = {};
  nodes.forEach((node) => {
    nodeMap[node.nodeId] = node.toJSON();
    nodeMap[node.nodeId].children = [];
  });

  nodes.forEach((node) => {
    if (node.parentId) {
      nodeMap[node.parentId].children.push(nodeMap[node.nodeId]);
    }
  });

  return Object.values(nodeMap).filter(node => !node.parentId);
};

module.exports = {
  createNode,
  updateNode,
  deleteNode,
  getTree,
};
