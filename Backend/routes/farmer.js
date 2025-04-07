const express = require('express')
const jwt = require('jsonwebtoken')
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
        coordinatorId: z.string(),
        role: z.string()
    })

    const parsedData = userSignupRequiredBody.safeParse(req.body)

    // Add this validation check
    if (!parsedData.success) {
        return res.status(400).json({
            success: false,
            errors: parsedData.error.errors
        });
    }

    try {
        const { name, email, phone, password, role, coordinatorId } = parsedData.data;

        const exitingFarmer = await Farmer.findOne({ email })

        if (exitingFarmer) return res.status(409).send("Farmer already exits")

        const hash = await bcrypt.hash(password, 10)

        const newFarmer = await Farmer.create({
            name,
            email,
            phone,
            password: hash,
            role,
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
        email: z.string().email(),
        password: z.string().min(6),
        role: z.string()
    });

    const parsedData = userSigninRequiredBody.safeParse(req.body)

    if (!parsedData.success) {
        return res.status(400).json({ success: false, message: parsedData.error.errors });
    }

    try {
        const { email, password, role } = parsedData.data;

        // Find farmer by email or phone
        const farmer = await Farmer.findOne({ email, role })

        if (!farmer) return res.status(404).json({ success: false, message: "farmer not found" });

        // Compare password
        const comparePassword = await bcrypt.compare(password, farmer.password);
        if (!comparePassword) return res.status(400).json({ success: false, message: "Invalid credentials" });

        //Generate JWT
        const token = jwt.sign({ id: farmer._id, role }, process.env.JWT_SECRET, { expiresIn: "1h" })

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
            farmerId: req.farmer._id
        });

        res.status(200).json({
            success: true,
            message: "Crop added successfully",
            newCrop
        });
    } catch (error) {
        console.log(error);
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
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
})

//preview all crops
farmerRouter.get('/preview-crops', farmerAuth, async (req, res) => {
    try {
        // Filter crops by the current farmer's ID
        const crops = await cropModel.find({ farmerId: req.farmer._id })

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
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
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
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
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
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
})

module.exports = {
    farmerRouter
}