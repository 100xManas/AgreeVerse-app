const express = require('express')
const { z, number } = require('zod')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const farmerRouter = express.Router()

dotenv.config()

const { farmerAuth } = require('../middleware/auth')
const { Farmer, cropModel } = require('../models/db')

farmerRouter.post('/signup', async (req, res) => {
    const userSignupRequiredBody = z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string().transform(data => Number(data)),
        password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
        coordinatorId: z.string()
    })

    const parsedData = userSignupRequiredBody.safeParse(req.body)

    // Add this validation check
    if (!parsedData.success) {
        return res.status(400).json({
            success: false,
            errors: parsedData.error.errors
        });
    }

    console.log(parsedData.data);


    try {
        const { name, email, phone, password, coordinatorId } = parsedData.data;

        const exitingFarmer = await Farmer.findOne({
            $or: [{ phone }, { email }]
        })

        if (exitingFarmer) return res.status(409).send("Farmer already exits")

        const hash = await bcrypt.hash(password, 10)

        const newFarmer = await Farmer.create({
            name,
            email,
            phone,
            password: hash,
            coordinatorId
        })

        if (newFarmer) {
            res.status(201).json({
                success: true,
                message: "New farmer created successfully"
            })
        }

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server crash")
    }
})

farmerRouter.post('/signin', async (req, res) => {

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

        // Find farmer by email or phone
        const farmer = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        })

        if (!farmer) return res.status(404).json({ success: false, message: "User not found" });

        // Compare password
        const comparePassword = await bcrypt.compare(password, user.password);
        if (!comparePassword) return res.status(400).json({ success: false, message: "Invalid credentials" });

        //Generate JWT
        const token = jwt.sign({ userId: farmer._id }, process.env.JWT_FARMER_SECRET, { expiresIn: "1h" })

        res.cookie("token", token, {
            httpOnly: true,  // Prevents JavaScript access (XSS protection)
            secure: true,    // Works only on HTTPS
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
        }).status(200).json({
            success: true,
            message: 'Farmer signin successfull.'
        })

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server crash")
    }
})

farmerRouter.post('/signout', (req, res) => {
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

farmerRouter.get('/dashboard', farmerAuth, (req, res) => {
    res.json({
        success: true,
        message: "Farmer login successfully",
        user: req.farmer,
    })
})

//add crops add the platform
farmerRouter.post('/add-crop', farmerAuth, async (req, res) => {
    const addCropRequiredBody = z.object({
        title: z.string(),
        description: z.string(),
        imageURL: z.string(),
        tag: z.string(),
        price: z.number()
    })

    const parsedData = addCropRequiredBody.safeParse(req.body)

    if (!parsedData.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid input data"
        });
    }

    try {

        const { title, description, imageURL, tag, price } = parsedData.data

        const newCrop = await cropModel.create({
            title,
            description,
            imageURL,
            tag,
            price,
            farmerId: req.farmer._id  // Assuming farmerAuth middleware adds farmer to req
        });

        res.status(200).json({
            success: true,
            message: "Crop added successfully",
            newCrop
        });
    } catch (error) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Failed to add crop"
        });
    }
})

//update the crop by farmer
farmerRouter.put('/update-crop/:cropId', farmerAuth, async (req, res) => {
    try {
        const { cropId } = req.params;

        const { title, description, imageURL, tag, price } = req.body;

        const updateCrop = await cropModel.findOneAndUpdate({ _id: cropId }, {
            title,
            description,
            imageURL,
            tag,
            price
        }, {
            new: true
        })

        if (!updateCrop) {
            res.status(404).json({
                success: false,
                message: "Crop not found or not updated."
            })
            return
        }

        res.status(200).json({
            success: true,
            message: "Crop updated successfully"
        })
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server crash")
    }
})

//preview all crops
farmerRouter.get('/preview-crops', farmerAuth, async (req, res) => {
    try {
        const crops = await cropModel.find({})

        if (crops.length === 0) {
            res.status(404).json({
                success: false,
                message: "No crops found."
            })
            return
        }

        res.status(200).json({
            success: true,
            crops: crops
        })
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server crash")
    }
})

// preview all crops that added by the farmer
farmerRouter.get('/add-crops-farmer/:farmerId', farmerAuth, async (req, res) => {
    try {
        const { farmerId } = req.params

        const crops = await cropModel.find({ farmerId })

        if (crops.length === 0) {
            res.status(404).json({
                success: false,
                message: "No crops found."
            })
            return
        }

        res.status(200).json({
            success: true,
            crops: crops
        })
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server crash")
    }
})

//delete the crop
farmerRouter.delete('/delete-crop/:cropId', farmerAuth, async (req, res) => {
    try {
        const { cropId } = req.params;

        const deleteCrop = await cropModel.findOneAndDelete({ _id: cropId })

        if (!deleteCrop) {
            res.status(404).json({
                success: false,
                message: "Crop not found or not deleted."
            })
            return
        }

        res.status(200).json({
            success: true,
            message: "Crop deleted successfully"
        })
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server crash")
    }
})

module.exports = {
    farmerRouter
}