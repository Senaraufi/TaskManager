const User = require('./User');
const Task = require('./Task');

// Define relationships
User.hasMany(Task, { foreignKey: 'userId' });
Task.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Task
};
