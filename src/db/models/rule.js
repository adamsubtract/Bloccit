'use strict';
module.exports = (sequelize, DataTypes) => {
  const Rule = sequelize.define('Rule', {
    description: DataTypes.STRING
  }, {});
  Rule.associate = function(models) {
    // associations can be defined here
    Rule.belongsTo(models.Topic, {
      foreignKey: "topicId",
      onDelete: "CASCADE",
    });
  };
  return Rule;
};
