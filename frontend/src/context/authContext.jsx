import axios from "axios";
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [error, setError] = useState(null); // define error state

  const login = async (formData, navigate) => {
    try {
      console.log("login form data -->", formData);
      const res = await axios.post(
        "http://localhost:3000/api/auth/login",
        formData
      );
      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data));
      setUser(res.data.data);
      console.log(user);
      if (res) {
        navigate("/");
        console.log(user);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  const signup = async (formData, navigate) => {
    try {
      console.log("login form data -->", formData);
      const res = await axios.post(
        "http://localhost:3000/api/auth/signup",
        formData
      );
      localStorage.setItem("token", res.data.token);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        error,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
