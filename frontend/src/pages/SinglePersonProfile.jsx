import { useEffect, useState } from "react";

const SinglePersonProfile = ({
  details,
  setSelectedUser,
  selectedUser,
  socket,
}) => {
  const [lastMessage, setLastMessage] = useState("No messages yet");
  const [unreadCount, setUnreadCount] = useState(0);

  const isSelected = selectedUser?._id === details._id;

  useEffect(() => {
    if (!socket) return;

    const handlePrivateMessage = (data) => {
      if (data.senderId === details._id) {
        setLastMessage(
          data.message.length > 30
            ? data.message.substring(0, 30) + "..."
            : data.message
        );

        if (!isSelected) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    };

    socket.on("private-message", handlePrivateMessage);
    return () => socket.off("private-message", handlePrivateMessage);
  }, [socket, details._id, isSelected]);

  useEffect(() => {
    if (isSelected) {
      setUnreadCount(0);
    }
  }, [isSelected]);

  const handleClick = () => {
    setSelectedUser(details);
    setUnreadCount(0);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex justify-between items-center px-4 py-3 mx-2 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-blue-100 border-l-4 border-blue-500"
          : "hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex justify-center items-center bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-12 h-12 font-bold text-white text-lg">
          {details.userName.substring(0, 2).toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="font-semibold text-gray-800">{details.userName}</div>
          <div className="text-sm text-gray-600 truncate max-w-48">
            {lastMessage}
          </div>
        </div>
      </div>

      {unreadCount > 0 && (
        <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}
    </div>
  );
};

export default SinglePersonProfile;
