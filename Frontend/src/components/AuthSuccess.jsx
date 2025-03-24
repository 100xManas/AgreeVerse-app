import React, { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../useContext/AuthContext";

function AuthSuccess() {
    const { fetchUserDetails } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate(); 

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const userExists = queryParams.get("user") === "true"; 
        const role = queryParams.get("role");

        console.log("AuthSuccess Query Params:", { userExists, role }); // Debugging

        if (userExists && role) {
            const handleAuthSuccess = async () => {
                try {
                    await fetchUserDetails();
                    console.log("User data fetched, redirecting...");
                    navigate(`/${role}/home`);
                } catch (error) {
                    console.error("Error fetching user:", error);
                    navigate("/signin");
                }
            };

            handleAuthSuccess();
        } else {
            console.log("Invalid auth data, redirecting to signin...");
            navigate("/signin");
        }
    }, [location, navigate, fetchUserDetails]);

    return <div className="h-screen w-full bg-[#181a20] text-white text-center">Authenticating...</div>;
}

export default AuthSuccess;
