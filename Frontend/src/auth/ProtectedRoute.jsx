import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../useContext/AuthContext";
import Loading from "../components/Loading";

function ProtectedRoute({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    const { user } = useContext(AuthContext)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/v1/${user.role}/dashboard`, {
                    withCredentials: true,
                });

                if (res.data.success) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                setIsAuthenticated(false);
            }
        };

        fetchUser();
    }, []);

    if (isAuthenticated === null) return <Loading />;

    return isAuthenticated ? children : <Navigate to="/signin" />;
}

export default ProtectedRoute;