const Notification = require("../models/notificationModel");
const catchAsync = require("../utils/catchAsync");

exports.getNotifications = catchAsync(async (req, res) => {
  const userId = req.user.id; // Assuming user is authenticated and req.user contains user info

  const notifications = await Notification.find({
    user: userId,
    readStatus: false,
  }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    status: "success",
    results: notifications.length,
    data: {
      notifications,
    },
  });
});
