const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const coordinatorRouter = express.Router()
const dotenv = require('dotenv')
const { Coordinator, Farmer } = require('../models/db')
const { coordinatorAuth } = require('../middleware/auth')

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
        user:req.coordinator
    })
})

// Add farmer
coordinatorRouter.post('/:coordinatorId/add-farmer', coordinatorAuth, async (req, res) => {
    try {
        const { coordinatorId } = req.params;
        const { name, email, phoneNo, password } = req.body;

        // Validate required fields
        if (!name || !email || !phoneNo || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if farmer already exists
        const farmer = await Farmer.findOne({
            $or: [{ email }, { phoneNo }]
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
            phoneNo,
            password: hash,
            coordinatorId
        });

        res.status(201).json({
            success: true,
            message: `New farmer created by coordinator ${coordinatorId}`,
            data: {
                id: newFarmer._id,
                name: newFarmer.name,
                email: newFarmer.email,
                phoneNo: newFarmer.phoneNo
            }
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
coordinatorRouter.put('/:coordinatorId/update-farmer/:farmerId', coordinatorAuth, async (req, res) => {
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
coordinatorRouter.delete('/:coordinatorId/delete-farmer/:farmerId', coordinatorAuth, async (req, res) => {
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

// Get all farmers
coordinatorRouter.get('/:coordinatorId/all-farmers', coordinatorAuth, async (req, res) => {
    try {
        const { coordinatorId } = req.params;

        // Add pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get farmers with pagination
        const farmers = await Farmer.find({ coordinatorId })
            .select('-password')
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await Farmer.countDocuments({ coordinatorId });

        res.status(200).json({
            success: true,
            data: farmers,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

module.exports = coordinatorRouter