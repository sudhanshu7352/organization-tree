module.exports = (sequelize, DataTypes) => {
    const Node = sequelize.define('Node', {
      nodeId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nodeName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nodeType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nodeColor: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      parentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Nodes',
          key: 'nodeId',
        },
      },
    }, {
      indexes: [
        {
          fields: ['parentId'],
        },
      ],
    });
  
    Node.associate = (models) => {
      Node.hasMany(models.Node, {
        foreignKey: 'parentId',
        as: 'children',
      });
      Node.belongsTo(models.Node, {
        foreignKey: 'parentId',
        as: 'parent',
      });
    };
  
    return Node;
  };
  