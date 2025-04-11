import React, { createContext, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const isAuthenticated = !!user; // Derived authentication state

    // Fetch user details based on role
    const fetchUserDetails = async (role) => {
        if (!role) {
            console.error("Role is missing. Cannot fetch user details.");
            return;
        }

        try {
            const response = await axios.get(`https://agreeverse-app.onrender.com/api/v1/${role}/dashboard`, {
                withCredentials: true,
            });

            if (response.data.success) {
                setUser(response.data.user);
                localStorage.setItem("user", JSON.stringify(response.data.user));
            } else {
                setUser(null);
                localStorage.removeItem("user");
            }
        } catch (error) {
            console.error(`Error fetching ${role} user data:`, error);
            setUser(null);
            localStorage.removeItem("user");
        }
    };

    const logout = async () => {
        try {
            const response = await axios.post("https://agreeverse-app.onrender.com/api/v1/signout", {}, {
                withCredentials: true,
            });

            if (response.data.success) {
                setUser(null);
                localStorage.removeItem("user");
                console.log("Logged out successfully");
                
                return true;
            } else {
                console.error("Logout failed:", response.data.message);
                return false
            }
        } catch (error) {
            console.error("Error during logout:", error.response?.data || error.message);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, fetchUserDetails, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
