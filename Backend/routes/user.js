const express = require('express')
const bcrypt = require('bcrypt');
const { z, string } = require('zod')
const userRouter = express.Router()
const { userAuth } = require("../middleware/auth");
const jwt = require('jsonwebtoken');
const { User, cropModel, userPurchasedCropModel } = require('../models/db');

userRouter.post('/signup', async (req, res) => {

    const userSignupRequiredBody = z.object({
        username: z.string(),
        email: z.string().email(),
        phone: z.string(),
        password: z.string(),
        role: z.string()
    });

    const parsedData = userSignupRequiredBody.safeParse(req.body);

    const { username, email, phone, password, role } = parsedData.data;

    try {
        const existingUser = await User.findOne({ phone, email });

        if (existingUser) {
            return res.status(409).send("User already exists");
        }

        const hash = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name: username,
            email,
            phone,
            password: hash,
            role
        });

        if (newUser) {
            res.status(201).json({
                success: true,
                message: "New user created successfully"
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
});

userRouter.post('/signin', async (req, res) => {

    const userSigninRequiredBody = z.object({
        identifier: z.string().refine((value) => {
            return /\S+@\S+\.\S+/.test(value) || /^\d{10}$/.test(value);
        }, { message: "Invalid email or phone number format" }),
        password: z.string().min(6)
    });

    const parsedData = userSigninRequiredBody.safeParse(req.body)

    if (!parsedData.success) {
        return res.status(400).json({ success: false, message: parsedData.error.errors });
    }

    try {
        const { identifier, password } = parsedData.data;

        // Find user by email or phone
        const user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        })

        if (!user) return res.status(400).json({ success: false, message: "User not found" });

        // Compare password
        const comparePassword = await bcrypt.compare(password, user.password);
        if (!comparePassword) return res.status(400).json({ success: false, message: "Invalid credentials" });

        //Generate JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_USER_SECRET, { expiresIn: "1h" })

        res.cookie("token", token, {
            httpOnly: true,  // Prevents JavaScript access (XSS protection)
            secure: true,    // Works only on HTTPS
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
        }).status(200).json({
            success: true,
            message: 'User signin successfull with email'
        })

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server crash")
    }
})

userRouter.post('/signout', (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true, // Prevents JavaScript from accessing the cookie
            secure: true,
            sameSite: "lax", // Send the cookie in same-site requests and some cross-site requests
            expires: new Date(0) // Expire the cookie immediately
        })

        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server err" });
    }
})


userRouter.get('/dashboard', userAuth, (req, res) => {
    res.json({
        success: true,
        message: "User login successfully",
        user: req.user,
    })
})

// preview all the crops.
userRouter.get('/previewcrop', async (req, res) => {
    try {
        const crops = await cropModel.find({})
        res.status(200).json({ success: true, message: "Crops retrieved successfully", crops })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server err" });
    }
})

// purchase a crop by the user.
userRouter.post('/purchase-crop', userAuth, async (req, res) => {

    const userId = req.user._id; //come from middleware
    const { cropId } = req.body;

    const user = await User.findOne({ _id: userId })

    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    try {
        const crop = await cropModel.findOne(cropId)

        if (!crop) {
            return res.status(404).json({ message: "Crop not found" });
        }

        // Add payment system (using Stripe) 
        // --> Below code is for only look for now.
        const paymentIntent = await stripe.paymentIntents.create({
            amount: crop.price * 100,
            currency: "inr",
            metadata: {
                userId: userId.toString(),
                cropId: cropId,
                priceAtPurchase: crop.price
            }
        });

        if (paymentIntent.status === 'success') {
            userPurchasedCropModel.purchasedCrops.push(cropId)
            await userPurchasedCropModel.save()
        }

        const newPurchase = new userPurchasedCropModel({
            userId: userId,
            purchasedCrops: [cropId],
            quantity: quantity,
            paymentId: paymentIntent.id,
            paymentMethod: paymentMethod,
            paymentStatus: 'pending',
            totalAmount: totalAmount
        });

        await newPurchase.save();

        return res.status(200).json({
            success: true,
            message: "Purchase completed successfully",
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            purchaseId: newPurchase._id
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server err" });
    }

})

// Retrieve all purchases of crops by the users
userRouter.get('/user-purchases/:userId', userAuth, async (req, res) => {
    const { userId } = req.params;

    try {
        // Find all purchase documents for this user
        const purchases = await userPurchasedCropModel.find({ userId }).populate('purchasedCrops.cropId');

        if (purchases.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No purchases found for this user",
                purchases: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Successfully retrieved all the crops purchased by the user",
            purchases
        });

    } catch (err) {
        console.error('Error retrieving user purchases:', err);
        res.status(500).json({ message: "Internal server err" });
    }
});

module.exports = {
    userRouter
}