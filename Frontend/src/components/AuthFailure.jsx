import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const AuthFailure = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const errorMessage = searchParams.get("error") || "Authentication failed.";

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/signin");
        }, 7000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#181a20] px-6">
            <div className="bg-[#1e2329] text-white border border-gray-700 rounded-xl shadow-lg p-8 max-w-md text-center">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
                <h1 className="text-2xl font-bold mt-4">Authentication Failed</h1>
                <p className="text-gray-400 mt-2">{errorMessage}</p>

                <div className="flex items-center justify-center gap-1 mt-4">
                    <span>Redirecting to sign-in</span>
                    <div className="h-1 w-1 mt-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "-0.3s" }}></div>
                    <div className="h-1 w-1 mt-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "-0.15s" }}></div>
                    <div className="h-1 w-1 mt-2.5 bg-white rounded-full animate-bounce"></div>
                </div>

                <button
                    onClick={() => navigate("/signin")}
                    className="mt-5 px-6 py-2 bg-orange-500 text-white rounded-md duration-300 cursor-pointer hover:bg-orange-600 transition"
                >
                    Go to Sign In Now
                </button>
            </div>
        </div>
    );
};

export default AuthFailure;
