const Message = require("../models/message");

exports.getChatHistory = async (req, res) => {
  try {
    const { userId, otherUserId } = req.body;

    if (!userId || !otherUserId) {
      return res.status(400).json({
        success: false,
        error: "Both userId and otherUserId are required",
      });
    }

    // Find all messages between these two users
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    })
      .sort({ timestamp: 1 }) 
      .limit(100); 

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching chat history",
    });
  }
};

exports.saveMessage = async (messageData) => {
  try {
    const message = new Message(messageData);
    const savedMessage = await message.save();
    return savedMessage;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};

exports.markMessagesAsRead = async (req, res) => {
  try {
    const { userId, otherUserId } = req.body;

    await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      error: "Server error while marking messages as read",
    });
  }
};
