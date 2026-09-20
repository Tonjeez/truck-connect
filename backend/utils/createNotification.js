const Notification = require('../models/Notification');

const createNotification = async ({ user, type, message, relatedJob }) => {
  await Notification.create({ user, type, message, relatedJob });
};

module.exports = createNotification;
