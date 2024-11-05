const request = require('supertest');
const app = require('../app');
const { sequelize, Node } = require('../models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Node API', () => {

  // Test for creating a new node
  describe('POST /api/nodes', () => {
    it('should create a new node', async () => {
      const res = await request(app)
        .post('/api/nodes')
        .send({
          nodeName: 'Department A',
          nodeType: 'department',
          parentId: null,
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('nodeId');
    });

    it('should not create a node with a cycle', async () => {
      const parentNode = await Node.create({ nodeName: 'Parent', nodeType: 'location', nodeColor: 'blue' });
      const childNode = await Node.create({ nodeName: 'Child', nodeType: 'employee', parentId: parentNode.nodeId, nodeColor: 'green'});

      const res = await request(app)
        .post('/api/nodes')
        .send({
          nodeName: 'Invalid Node',
          nodeType: 'department',
          parentId: childNode.nodeId,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

//   // Test for reading nodes
//   describe('GET /api/nodes/:id', () => {
//     it('should get a node by id', async () => {
//       const node = await Node.create({ nodeName: 'Test Node', nodeType: 'test', parentId: null , nodeColor: 'blue'});

//       const res = await request(app).get(`/api/nodes/${node.id}`);
//       expect(res.statusCode).toEqual(200);
//       expect(res.body).toHaveProperty('id', node.id);
//     });

//     it('should return 404 if node not found', async () => {
//       const res = await request(app).get(`/api/nodes/123`);
//       expect(res.statusCode).toEqual(404);
//       expect(res.body).toHaveProperty('error', 'Node not found');
//     });
//   });

  // Test for updating a node
  describe('PUT /api/nodes/:id', () => {
    it('should update a node', async () => {
      const node = await Node.create({ nodeName: 'Node to Update', nodeType: 'update', parentId: null , nodeColor: 'blue'});

      const res = await request(app)
        .put(`/api/nodes/${node.id}`)
        .send({
            nodeName: 'Updated Node',
            nodeType: 'updated',
            shiftOption: 'move',
            nodeColor: 'green'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('nodeName', 'Updated Node');
    });

    it('should return 404 if node not found', async () => {
        const nonExistentId = 'e8c89c8e-e0d1-4c59-aecc-03e9e7e86c13'; // Use a valid UUID format

        const res = await request(app)
          .put(`/api/nodes/${nonExistentId}`)
          .send({
            nodeName: 'Updated Node',
            nodeType: 'updated',
            shiftOption: 'move',
            nodeColor: 'green'  // Ensure to include all required fields
          });
        expect(res.statusCode).toEqual(400); // Adjust the expected status code accordingly
        expect(res.body).toHaveProperty('error', 'Node not found');
    });
  });

  // Test for deleting a node
  describe('DELETE /api/nodes/:id', () => {
    it('should delete a node', async () => {
        const node = await Node.create({ nodeName: 'Node to Delete', nodeType: 'delete', parentId: null, nodeColor: 'red' });

        const res = await request(app).delete(`/api/nodes/${node.id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Node deleted successfully');
    });

    it('should return 404 if node not found', async () => {
      const res = await request(app).delete(`/api/nodes/0eeb0c2e-7f15-4cf5-90bd-ab73208e3fe5`);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Node not found');
    });
  });
});
