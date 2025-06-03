import axios from "axios";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "../context/authContext";
import MessagesWithSelectedProfile from "./MessagesWithSelectedProfile";
import SinglePersonProfile from "./SinglePersonProfile";

const Home = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [userData, setUserData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const newSocket = io("http://localhost:3000", {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
      newSocket.emit("register", user._id);
    });

    return () => {
      newSocket.close();
    };
  }, [user]);

  useEffect(() => {
    const getUsersDetails = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const userResponse = await axios.post(
          "http://localhost:3000/api/auth/fetchAllUserData",
          { userID: user._id }
        );

        if (userResponse.data.success) {
          setUserData(userResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching users data:", error);
      } finally {
        setLoading(false);
      }
    };

    getUsersDetails();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Please log in to continue</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <h2 className="text-xl font-bold">Chats</h2>
          <p className="text-blue-100 text-sm">Welcome, {user.userName}!</p>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Loading contacts...
            </div>
          ) : userData.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No other users found
            </div>
          ) : (
            <div className="space-y-2 py-2">
              {userData.map((details) => (
                <SinglePersonProfile
                  key={details._id}
                  details={details}
                  setSelectedUser={setSelectedUser}
                  selectedUser={selectedUser}
                  socket={socket}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <MessagesWithSelectedProfile
          socket={socket}
          selectedUser={selectedUser}
        />
      </div>
    </div>
  );
};

export default Home;
