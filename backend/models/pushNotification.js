const mongoose = require("mongoose");

const pushNotificationSchema = new mongoose.Schema(
  {
    userName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    notificationTite: {
      type: String,
      required: true,
    },
    notificationContent: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("pushNotificatonModel", pushNotificationSchema);
