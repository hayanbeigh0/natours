const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["invite", "general"],
    default: "general",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  readStatus: { type: Boolean, default: false },
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
