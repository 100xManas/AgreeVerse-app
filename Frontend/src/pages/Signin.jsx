import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";
import axios from "axios";

export default function Signin() {
    const [passwordShown, setPasswordShown] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [authType, setAuthType] = useState('');

    const navigate = useNavigate()

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const authError = urlParams.get('error');

        if (authError) {
            setError(decodeURIComponent(authError));
        }
    }, []);

    const handleRegularSignIn = (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Email and password are required');
            return;
        }
        // Show role selection modal
        setAuthType('local');
        setShowRoleModal(true);
    };

    const handleGoogleSignIn = () => {
        // Show role selection modal first before redirecting to Google
        setAuthType('google');
        setShowRoleModal(true);
    };

    const handleRoleSelection = async (role) => {
        if (authType === 'local') {

            try {
                setLoading(true);
                setError('');

                const response = await axios.post(`http://agreeverse-app-deployement.onrender.com/api/v1/${role}/signin`, {
                    email,
                    password,
                    role
                }, { withCredentials: true });

                if (response.data.success) {
                    alert(response.data.message);

                    navigate(`/auth-success?newUser=true&role=${role}`);
                } else {
                    alert(data.message || "Signin failed");
                }

            } catch (err) {
                console.error('Login failed', err);
                setError(err.response?.data?.message || 'Authentication failed');
            } finally {
                setLoading(false);
                setShowRoleModal(false);
            }
        } else if (authType === 'google') {
            window.location.href = `http://agreeverse-app-deployement.onrender.com/auth/google?role=${role}`;
        }
    };

    return (
        <>
            <div className="fixed h-full w-full bg-neutral-900"><div className="absolute inset-0 bg-fuchsia-400 bg-[size:20px_20px] opacity-20 blur-[100px]"></div></div>

            <section className="min-h-screen w-full absolute flex items-center justify-center px-3">
                <div className="w-full lg:w-1/3 py-10 shadow-xl rounded-lg p-6 dark:bg-gray-600">
                    <h3 className="text-3xl font-medium text-white mb-10 text-center">Hi, Welcome Back! 👋</h3>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                            <button
                                className="absolute top-0 right-0 px-4 py-3"
                                onClick={() => setError('')}
                            >
                                <span className="sr-only">Close</span>
                                <span className="text-xl">&times;</span>
                            </button>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleRegularSignIn}>
                        <div>
                            <label htmlFor="email" className="block text-md font-medium text-white">
                                Your Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@gmail.com"
                                className="bg-gray-700 text-white mt-2 w-full rounded-lg border-gray-300 px-2 py-3 text-md focus:ring-2 focus:ring-[#FF9119]/50 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-md font-medium text-white">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={passwordShown ? "text" : "password"}
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="********"
                                    className="mt-2 bg-gray-700 text-white w-full h-full rounded-lg border-gray-300 px-2 py-3 text-md shadow-sm focus:ring-2 focus:outline-none focus:ring-[#FF9119]/50 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setPasswordShown((prev) => !prev)}
                                    className="absolute inset-y-8 right-0 flex items-center pr-3"
                                >
                                    {passwordShown ? (
                                        <EyeIcon className="h-5 w-5 text-gray-500" />
                                    ) : (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full text-black cursor-pointer font-medium py-2.5 rounded-lg transition duration-300 ease-in-out bg-[#FF9119] hover:bg-transparent hover:border hover:border-[#FF9119] border border-[#FF9119] hover:text-white focus:ring-2 focus:outline-none focus:ring-[#FF9119]/50"
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>

                        <div className="flex items-center">
                            <hr className="flex-grow border-gray-300" />
                            <span className="px-3 text-gray-500 text-sm">OR</span>
                            <hr className="flex-grow border-gray-300" />
                        </div>

                        <button
                            type="button"
                            className="flex w-full items-center justify-center cursor-pointer gap-2 border border-orange-300 py-2.5 rounded-lg text-md text-white hover:bg-[#FF9119] hover:text-black focus:ring-2 focus:outline-none focus:ring-[#FF9119]/50 font-medium px-6 transition duration-300 ease-in-out"
                            onClick={handleGoogleSignIn}
                        >
                            <img
                                src="https://www.material-tailwind.com/logos/logo-google.png"
                                alt="Google"
                                className="h-5 w-5"
                            />
                            Continue with Google
                        </button>
                    </form>
                </div>
            </section>

            {/* Role Selection Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-[#181a20] bg-opacity-100 flex justify-center items-center z-50">
                    <div className="bg-gray-700 p-10 rounded-lg shadow-lg text-center">
                        <h3 className="text-lg text-white font-semibold mb-4">Select Your Role</h3>
                        <div className="grid grid-cols-2 gap-5">
                            <button onClick={() => handleRoleSelection("admin")}
                                className="py-2.5 px-5 hover:cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-600">
                                Admin
                            </button>
                            <button onClick={() => handleRoleSelection("coordinator")}
                                className="py-2.5 px-5 hover:cursor-pointer bg-green-500 text-white rounded hover:bg-green-600">
                                Coordinator
                            </button>
                            <button onClick={() => handleRoleSelection("farmer")}
                                className="py-2.5 px-5 hover:cursor-pointer bg-yellow-500 text-white rounded hover:bg-yellow-600">
                                Farmer
                            </button>
                            <button onClick={() => handleRoleSelection("user")}
                                className="py-2.5 px-5 hover:cursor-pointer bg-red-500 text-white rounded hover:bg-red-600">
                                User
                            </button>
                        </div>

                        <button
                            onClick={() => setShowRoleModal(false)}
                            className="mt-6 py-2 px-5 border border-gray-500 cursor-pointer text-white rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}