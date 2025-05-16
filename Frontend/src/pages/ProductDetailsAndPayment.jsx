import React, { useState, useEffect, useContext } from "react";
import Loading from "../components/Loading";
import { CircleArrowRight, CircleArrowLeft, Truck } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../useContext/AuthContext";

const ProductDetailsAndPayment = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deliveryAddress, setDeliveryAddress] = useState({
        name: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
    });
    const [userId, setUserId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("razorpay");

    const { productId } = useParams();

    const { user } = useContext(AuthContext)
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `http://agreeverse-app-deployement.onrender.com/api/v1/user/product/${productId}`
                );

                if (!response.ok) {
                    throw new Error("Product not found");
                }

                const data = await response.json();
                console.log("Fetched product data:", data.product);
                setProduct(data.product);

                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    useEffect(() => {
        if (user && user._id) {
            setUserId(user._id);
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDeliveryAddress((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleQuantityChange = (e) => {
        setQuantity(parseInt(e.target.value) || 1);
    };

    const SubmitAndCheckoutHandler = async (e) => {
        e.preventDefault();

        if (!userId) {
            alert("Please log in to continue with the purchase");
            return;
        }

        try {
            const { data: { order } } = await axios.post('http://agreeverse-app-deployement.onrender.com/api/v1/createOrder', {
                price: product.price * quantity,
                productId: productId,
                userId: userId,
                quantity: quantity,
                paymentMethod
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: "INR",
                name: "AgreeVerse App",
                description: "Test Transaction",
                image: "",
                order_id: order.id,
                handler: function (response) {
                    // Updated to match your backend verification requirements
                    axios.post('http://agreeverse-app-deployement.onrender.com/api/v1/verifyPayment', {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        userId: userId,
                        cropId: productId, // Assuming product ID is the same as crop ID
                        quantity: quantity,
                        deliveryAddress: {
                            name: deliveryAddress.name,
                            street: deliveryAddress.street,
                            city: deliveryAddress.city,
                            state: deliveryAddress.state,
                            zip: deliveryAddress.zip,
                            country: deliveryAddress.country
                        },
                        paymentMethod: paymentMethod,
                        email: "manasranjansahoo971@gmail.com"  // Ideally this should come from user profile
                    })
                        .then(response => {
                            if (response.data.success) {
                                alert("Payment successful! You'll receive a confirmation email shortly.");
                               
                                // Redirect to  success page
                                navigate('/payment-success', {
                                    state: {
                                        orderId: response.razorpay_order_id,
                                        paymentId: response.razorpay_payment_id,
                                        paymentMethod,
                                        amount: order.amount,
                                      }
                                })
                               
                            } else {
                                alert("Payment verification failed: " + response.data.message);
                            }
                        })
                        .catch(error => {
                            alert("Payment verification failed");
                            console.error("Payment verification error:", error);
                        });
                },

                // login user details
                "prefill": {
                    "name": user.name || "100xManas",
                    "email": user.email || "manasranjansahoo971@gmail.com",
                    "contact": "7848965736"
                },
                notes: {
                    "address": "Razorpay Corporate Office"
                },
                theme: {
                    "color": "#3399cc"
                }
            };

            const razor = new window.Razorpay(options);
            razor.open();

        } catch (error) {
            console.error("Payment initialization error:", error);
            alert("Failed to initialize payment. Please try again.");
        }
    };

    if (loading) {
        return <Loading />
    }

    if (error) {
        return (
            <div className="bg-zinc-900 min-h-screen flex items-center justify-center p-4">
                <div className="border border-gray-700 p-6 rounded-lg shadow-lg text-center max-w-md">
                    <p className="text-red-400 text-lg mb-3">Something went wrong!</p>

                    <Link to={'/'} className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm">
                        Home
                    </Link>
                </div>
            </div>
        );
    }

    return product ? (
        <div className="min-h-screen bg-gray-900 py-4 sm:py-6">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <Link to={'..'} className="text-white hover:text-orange-300 cursor-pointer font-medium mb-4 flex items-center gap-1 transition-colors text-md">
                    <CircleArrowLeft size={16} />
                    Back
                </Link>

                {/* Product Details */}
                <div className="py-5 px-2 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7 p-4">
                        {/* Product Image - Fixed height container */}
                        <div className="flex items-center justify-center ">
                            <div className="bg-white rounded-lg overflow-hidden flex items-center justify-center p-4 h-72 w-full">
                                <img
                                    src={product.imageURL}
                                    alt={product.title}
                                    className="max-h-52 max-w-full object-contain transition-transform hover:scale-105"
                                />
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col h-full">
                            <div className="flex-grow">
                                <div className="flex items-center mb-2">
                                    <span className="bg-zinc-700 capitalize text-white text-xs px-2.5 py-1.5 rounded-full mr-2">
                                        {product.tag}
                                    </span>
                                </div>

                                <h1 className="text-xl font-bold text-white mb-3 line-clamp-2">
                                    {product.title}
                                </h1>

                                {/* Fixed height for description with scrollbar */}
                                <div className="text-gray-300 mb-2 text-sm h-12 line-clamp-3 leading-relaxed overflow-y-auto pr-2">
                                    {product.description}
                                </div>

                                <div className="flex items-center mb-4">
                                    <div className="text-md font-bold text-white">
                                        Price: ₹{product.price?.toFixed(2)}
                                    </div>
                                </div>

                                {/* Quantity Selector */}
                                <div className="mb-4">
                                    <label htmlFor="quantity" className="block text-xs font-medium text-gray-300 mb-1">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        name="quantity"
                                        min="1"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        className="block w-24 h-8 px-3 py-1 bg-gray-800 border border-gray-600 rounded text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                </div>

                                {/* Total Price */}
                                <div className="flex items-center mb-4">
                                    <div className="text-xl font-bold text-white">
                                        Total: ₹{(product.price * quantity).toFixed(2)}
                                    </div>
                                </div>

                                {/* Delivery Address Form */}
                                <div className="bg-zinc-700 rounded-lg shadow p-4">
                                    <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
                                        <Truck size={16} className="mr-2 text-blue-400" />
                                        Delivery Address
                                    </h2>
                                    <form onSubmit={SubmitAndCheckoutHandler} className="space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {/* Form fields with consistent height */}
                                            {[
                                                { id: "name", label: "Full Name", placeholder: "Enter name" },
                                                { id: "street", label: "Street Address", placeholder: "Enter street" },
                                                { id: "city", label: "City", placeholder: "Enter city" },
                                                { id: "state", label: "State", placeholder: "Enter state" },
                                                { id: "zip", label: "ZIP Code", placeholder: "Enter ZIP" },
                                                { id: "country", label: "Country", placeholder: "Enter country" }
                                            ].map((field) => (
                                                <div key={field.id}>
                                                    <label
                                                        htmlFor={field.id}
                                                        className="block text-xs font-medium text-gray-300 mb-1"
                                                    >
                                                        {field.label}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id={field.id}
                                                        name={field.id}
                                                        value={deliveryAddress[field.id]}
                                                        onChange={handleInputChange}
                                                        className="block w-full h-8 px-3 py-1 bg-gray-800 border border-gray-600 rounded text-gray-200 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-sm"
                                                        required
                                                        placeholder={field.placeholder}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Submit Button with fixed height */}
                                        <button
                                            type="submit"
                                            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded font-medium transition flex items-center justify-center cursor-pointer mt-4 text-sm"
                                        >
                                            Submit & Proceed to payment
                                            <CircleArrowRight className="ml-2" size={16} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : null;
};

export default ProductDetailsAndPayment;