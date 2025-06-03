// MessagesWithSelectedProfile.jsx - Enhanced with chat history
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";

const MessagesWithSelectedProfile = ({ socket, selectedUser }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedUser || !user) return;

    const loadChatHistory = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:3000/api/chat/history",
          {
            userId: user._id,
            otherUserId: selectedUser._id,
          }
        );

        if (response.data.success) {
          const formattedMessages = response.data.data.map((msg) => ({
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            message: msg.message,
            timestamp: msg.timestamp,
            self: msg.senderId === user._id,
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();
  }, [selectedUser, user]);

  const handleSend = () => {
    if (!selectedUser || !message.trim()) return;

    const payload = {
      senderId: user._id,
      receiverId: selectedUser._id,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    socket.emit("private-message", payload);
    setMessages((prev) => [...prev, { ...payload, self: true }]);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handlePrivateMessage = (data) => {
      setMessages((prev) => [...prev, { ...data, self: false }]);
    };

    socket.on("private-message", handlePrivateMessage);
    return () => socket.off("private-message", handlePrivateMessage);
  }, [socket]);

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-blue-500 text-white p-4 rounded-t-lg">
        <h3 className="font-bold text-lg">{selectedUser.userName}</h3>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
        {loading ? (
          <div className="text-center text-gray-500">
            Loading chat history...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.self ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.self
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none shadow"
                }`}
              >
                <div className="break-words">{msg.message}</div>
                {msg.timestamp && (
                  <div
                    className={`text-xs mt-1 ${
                      msg.self ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t flex space-x-3">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessagesWithSelectedProfile;
