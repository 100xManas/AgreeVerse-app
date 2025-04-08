import React, { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../useContext/AuthContext";

function AuthSuccess() {
    const { fetchUserDetails, user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const userExists = queryParams.get("newUser") === "true";
        const role = queryParams.get("role")

        if (userExists) {
            const handleAuthSuccess = async () => {
                try {
                    await fetchUserDetails(role); 
                    // console.log("User data fetched:", user);

                    if (user?.role === "user") {
                        navigate(`/${user.role}/home`);
                    } else if (user?.role) {
                        navigate(`/${user.role}/dashboard`);
                    }
                    else {
                        navigate("/signin");
                    }
                } catch (error) {
                    alert("Error fetching user");
                    console.log("Error fetching user:", error);
                    navigate("/signin");
                }
            };

            handleAuthSuccess();
        } else {
            alert("Invalid auth data, redirecting to signin...");
            navigate("/signin");
        }
    }, [location, navigate, fetchUserDetails, user]);

    return (
        <div className="h-screen w-full bg-[#181a20] text-white text-center">
            <div className="flex items-center justify-center gap-1">
                <span>Authenticating</span>
                <div className="h-1 w-1 mt-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "-0.3s" }}></div>
                <div className="h-1 w-1 mt-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "-0.15s" }}></div>
                <div className="h-1 w-1 mt-2.5 bg-white rounded-full animate-bounce"></div>
            </div>
        </div>
    );
}

export default AuthSuccess;
