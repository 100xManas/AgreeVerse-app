const crypto = require('crypto')
const nodemailer = require('nodemailer')
const createRazorpayInstance = require('../config/razorpay.config')
const { paymentModel, userPurchasedCropModel, cropModel } = require('../models/db')

require("dotenv").config(); 

const razorpayInstance = createRazorpayInstance()

// only order the payment 
const createOrder = async (req, res) => {
    
    // => Always fetch price from DB.

    try {
        const { userId, productId, quantity, paymentMethod } = req.body;        

        if (!userId || !productId || !quantity) {
            return res.status(400).json({
                success: false,
                message: "All fields (userId, productId, quantity) are required.",
            });
        }

        // Fetch crop price from DB
        const crop = await cropModel.findById(productId);
        if (!crop) {
            return res.status(404).json({ success: false, message: "Crop not found" });
        }

        const totalAmount = crop.price * quantity;

        // Create order
        const options = {
            amount: totalAmount * 100, // amount in the smallest currency unit
            currency: 'INR',
            receipt: 'receipt_order_' + Date.now()
        }

        const order = await razorpayInstance.orders.create(options)

        // Store payment details in DB (Initial status = 'pending')
        const newPayment = await paymentModel.create({
            userId,
            paymentId: order.id,
            paymentMethod,
            amount: totalAmount,
            paymentStatus: "pending",
        })

        res.status(200).json({
            success: true,
            paymentId: newPayment._id,
            order
        });

    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

// make payment
const verifyPayment = async (req, res) => {

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, productId, quantity, deliveryAddress, paymentMethod, email } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !productId || !quantity || !deliveryAddress) {
            return res.status(400).json({
                success: false,
                message: "All fields are required for payment verification.",
            });
        }

        // Verify payment signature
        // Create HMAC object
        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);

        // Update the HMAC with order_id and payment_id
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);

        // Generate the hash signature
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature !== signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed!",
            });
        }

        // Send Confirmation Email
        const tranporter = nodemailer.createTransport({
            service:"Gmail",
            auth:{
                user:process.env.EMAIL_USER,
                password:process.env.EMAIL_PASSWORD
            }
        })

        const mailOptios = {
            from:process.env.EMAIL_USER ,
            to:email,
            subject: "Payment Confirmation",
            text: `Your payment was successful. Thank you for your purchase!`
        }

        await tranporter.sendMail(mailOptios)

        // Update payment status in DB
        const payment = await paymentModel.findOneAndUpdate(
            { paymentId: razorpay_order_id },
            { paymentStatus: "completed" },
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment record not found!" });
        }

        await userPurchasedCropModel.create({
            user: userId,
            purchasedCrops: [productId],
            quantity,
            payment: payment._id,
            totalAmount: payment.amount,
            paymentMethod,
            deliveryAddress,
            purchasedAt: Date.now(),
        })

        return res.status(200).json({
            success: true,
            message: "Payment verified, purchase recorded successfully & email sent",
        });

    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports = { createOrder, verifyPayment }