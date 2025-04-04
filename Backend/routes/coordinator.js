const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const coordinatorRouter = express.Router()
const dotenv = require('dotenv')
const { Coordinator, Farmer, cropModel } = require('../models/db')
const { coordinatorAuth } = require('../middleware/auth')
const { z } = require("zod")

dotenv.config()

coordinatorRouter.post('/signup', async (req, res) => {

    const coordinatorSignupRequiredBody = z.object({
        name: z.string(),
        email: z.string().email(),
        phoneNo: z.string().transform(data => Number(data)),
        password: z.string().min(6, { message: "Password must be at least 6 characters long." })
    })

    const parsedData = coordinatorSignupRequiredBody.safeParse(req.body)

    try {
        const { name, email, phoneNo, password } = parsedData.data;

        const exitingCoordinator = await Coordinator.findOne({ phoneNo, email })

        if (exitingCoordinator) return res.status(409).send("Coordinator already exits")

        const hash = await bcrypt.hash(password, 10)

        const newCoordinator = await Coordinator.create({
            name,
            email,
            phoneNo,
            password: hash
        })

        if (newCoordinator) {
            res.status(201).json({
                success: true,
                message: "New Coordinator created successfully"
            })
        }

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server crash")
    }
})

coordinatorRouter.post('/signin', async (req, res) => {

    const coordinatorSignupRequiredBody = z.object({
        identifier: z.string().refine((value) => {
            return /\S+@\S+\.\S+/.test(value) || /^\d{10}$/.test(value);
        }, { message: "Invalid email or phone number format" }),
        password: z.string().min(6)
    });

    const parsedData = coordinatorSignupRequiredBody.safeParse(req.body)

    if (!parsedData.success) {
        return res.status(400).json({ success: false, message: parsedData.error.errors });
    }

    try {
        const { identifier, password } = parsedData.data;

        // Find Coordinator by email or phone
        const coordinator = await Coordinator.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        })

        if (!coordinator) return res.status(404).json({ success: false, message: "User not found" });

        // Compare password
        const comparePassword = await bcrypt.compare(password, coordinator.password);
        if (!comparePassword) return res.status(400).json({ success: false, message: "Invalid credentials" });

        //Generate JWT
        const token = jwt.sign({ userId: Coordinator._id }, process.env.JWT_COORDINATOR_SECRET, { expiresIn: "1h" })

        res.cookie("token", token, {
            httpOnly: true,  // Prevents JavaScript access (XSS protection)
            secure: true,    // Works only on HTTPS
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
        }).status(200).json({
            success: true,
            message: 'Coordinator signin successfull.'
        })

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server crash")
    }
})

coordinatorRouter.post('/signout', (req, res) => {
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


// Coordinator access there profile and perform the CURD operation
coordinatorRouter.get('/dashboard', coordinatorAuth, (req, res) => {
    res.json({
        success: true,
        message: "Coordinator login successfully",
        user: req.coordinator
    })
})

// Get all farmers added by coordinator
coordinatorRouter.get('/all-farmers', coordinatorAuth, async (req, res) => {
    try {
        const coordinatorId = req.coordinator?.id;

        if (!coordinatorId) {
            return res.status(401).json({
                success: false,
                message: "Coordinator ID not found.",
            });
        }

        const farmers = await Farmer.find({ coordinatorId })

        res.status(200).json({
            success: true,
            message: farmers.length ? "Farmers retrieved successfully" : "No farmers found",
            farmers,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// Add farmer
coordinatorRouter.post('/add-farmer', coordinatorAuth, async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if farmer already exists
        const farmer = await Farmer.findOne({
            $or: [{ email }, { phone }]
        });

        if (farmer) {
            return res.status(409).json({
                success: false,
                message: "Farmer already exists with this email or phone number"
            });
        }

        // Hash password
        const hash = await bcrypt.hash(password, 10);

        // Create new farmer
        const newFarmer = await Farmer.create({
            name,
            email,
            phone,
            password: hash,
            coordinatorId: req.coordinator.id
        });

        console.log(newFarmer);


        res.status(201).json({
            success: true,
            message: `New farmer created by coordinator ${req.coordinator.id}`,
            newFarmer
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// Update farmer
coordinatorRouter.put('/update-farmer/:farmerId', coordinatorAuth, async (req, res) => {
    try {
        const { coordinatorId, farmerId } = req.params;
        const updateData = req.body;

        // Remove password from update data if present
        delete updateData.password;

        // Check if farmer exists and belongs to coordinator
        const farmer = await Farmer.findOne({
            _id: farmerId,
            coordinatorId
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found or not authorized"
            });
        }

        // Update farmer
        const updatedFarmer = await Farmer.findByIdAndUpdate(
            farmerId,
            { $set: updateData },
            { new: true, select: '-password' }
        );

        res.status(200).json({
            success: true,
            message: "Farmer updated successfully",
            data: updatedFarmer
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// Delete farmer
coordinatorRouter.delete('/delete-farmer/:farmerId', coordinatorAuth, async (req, res) => {
    try {
        const { coordinatorId, farmerId } = req.params;

        // Check if farmer exists and belongs to coordinator
        const farmer = await Farmer.findOne({
            _id: farmerId,
            coordinatorId
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found or not authorized"
            });
        }

        // Delete farmer
        await Farmer.findByIdAndDelete(farmerId);

        res.status(200).json({
            success: true,
            message: "Farmer deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});



// Get all crops added by coordinator
coordinatorRouter.get('/all-crops', coordinatorAuth, async (req, res) => {
    try {
        const coordinatorId = req.coordinator?.id;

        if (!coordinatorId) {
            return res.status(401).json({
                success: false,
                message: "Coordinator ID not found.",
            });
        }

        const crops = await cropModel.find({ coordinatorId })

        res.status(200).json({
            success: true,
            message: crops.length ? "crops retrieved successfully" : "No crops found",
            crops,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

//add crop by co-ordinator
coordinatorRouter.post('/add-crop', coordinatorAuth, async (req, res) => {
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
            coordinatorId: req.coordinator._id,
            farmerId:
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

//update crop by co-ordinator
coordinatorRouter.put('/update-crop/:cropId', coordinatorAuth, async (req, res) => {
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

//delete crop by co-ordinator
coordinatorRouter.delete('/delete-crop/:cropId', coordinatorAuth, async (req, res) => {
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

module.exports = coordinatorRouter