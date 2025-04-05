const express = require('express')
const jwt = require('jsonwebtoken')
const { z } = require('zod');
const bcrypt = require('bcrypt');
const { Admin, Coordinator, Farmer, cropModel, paymentModel } = require('../models/db')
const adminRouter = express.Router()
const googleAuthRouter = require('./googleAuth');
const { adminAuth } = require('../middleware/auth');

adminRouter.post('/signup', async (req, res) => {

    const adminSignupRequiredBody = z.object({
        name: z.string(),
        email: z.string().email(),
        phoneNo: z.string().transform(data => Number(data)),
        password: z.string().min(6, { message: "Password must be at least 6 characters long." })
    })

    const parsedData = adminSignupRequiredBody.safeParse(req.body)

    try {
        const { name, email, phoneNo, password } = parsedData.data;

        const exitingAdmin = await Admin.findOne({ phoneNo, email })

        if (exitingAdmin) return res.status(409).send("Admin already exits")

        const hash = await bcrypt.hash(password, 10)

        const newAdmin = await Admin.create({
            name,
            email,
            phoneNo,
            password: hash
        })

        if (newAdmin) {
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

adminRouter.post('/signin', async (req, res) => {

    const adminSignupRequiredBody = z.object({
        identifier: z.string().refine((value) => {
            return /\S+@\S+\.\S+/.test(value) || /^\d{10}$/.test(value);
        }, { message: "Invalid email or phone number format" }),
        password: z.string().min(6)
    });

    const parsedData = adminSignupRequiredBody.safeParse(req.body)

    if (!parsedData.success) {
        return res.status(400).json({ success: false, message: parsedData.error.errors });
    }

    try {
        const { identifier, password } = parsedData.data;

        // Find admin by email or phone
        const admin = await Admin.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        })

        if (!admin) return res.status(404).json({ success: false, message: "User not found" });

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
            message: 'Admin signin successfull.'
        })

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server crash")
    }
})

adminRouter.post('/signout', (req, res) => {
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

adminRouter.get('/dashboard', adminAuth, (req, res) => {
    res.json({
        success: true,
        message: "Admin login successfully",
        user: req.admin
    })
})

// Get all farmers
adminRouter.get("/get-farmers", adminAuth, async (req, res) => {
    try {
        const farmers = await Farmer.find().select("-password");
        res.status(200).json({
            success: true,
            message: farmers.length ? "Farmer retrived successfully" : "no former found",
            farmers
        });
    } catch (err) {
        console.log("Error fetching farmers:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Get all coordinators
adminRouter.get("/get-coordinators", adminAuth, async (req, res) => {
    try {
        const coordinators = await Coordinator.find().select("-password");
        res.status(200).json({
            success: true,
            message: coordinators.length ? "coordinators retrived successfully" : "no coordinator found",
            coordinators
        });
    } catch (err) {
        console.log("Error fetching coordinators:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Get all crops
adminRouter.get("/get-crops", adminAuth, async (req, res) => {
    try {
        const crops = await cropModel.find();
        res.status(200).json({
            success: true,
            message: crops.length ? "crops retrived successfully" : "no crops found",
            crops
        });
    } catch (err) {
        console.log("Error fetching crops:", err);
        res.status(500).json({ message: "Server error" });
    }
});


// Coordinator validation schema
const coordinatorSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phoneNo: z.string().regex(/^\d{10}$/),
    password: z.string().min(6),
});

// Farmer validation schema
const farmerSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phoneNo: z.string().regex(/^\d{10}$/),
    password: z.string().min(6),
    coordinatorId: z.string(),
});


// Add coordinator
adminRouter.post('/add-coordinator', adminAuth, async (req, res) => {
    try {
        // Validate input
        const validatedData = coordinatorSchema.safeParse(req.body);
        if (!validatedData.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validatedData.error.errors
            });
        }

        const { name, email, phoneNo, password } = validatedData.data;

        // Check if coordinator already exists
        const existingCoordinator = await Coordinator.findOne({
            $or: [{ email }, { phoneNo }]
        });

        if (existingCoordinator) {
            return res.status(409).json({
                success: false,
                message: "Coordinator already exists with this email or phone number"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create coordinator
        const newCoordinator = await Coordinator.create({
            name,
            email,
            phoneNo,
            password: hashedPassword,
        });

        res.status(201).json({
            success: true,
            message: "Coordinator added successfully",
        });

    } catch (error) {
        console.error('Add coordinator error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Update coordinator
adminRouter.put('/update-coordinator/:coordinatorId', adminAuth, async (req, res) => {
    try {
        const { coordinatorId } = req.params;
        const { name, email, phoneNo, password } = req.body;

        // Validate coordinator exists
        const coordinator = await Coordinator.findById(coordinatorId);
        if (!coordinator) {
            return res.status(404).json({
                success: false,
                message: "Coordinator not found"
            });
        }

        const newHash = bcrypt.hash(password, 10)

        // Update coordinator
        const updatedCoordinator = await Coordinator.findByIdAndUpdate(
            coordinatorId,
            {
                name,
                email,
                phoneNo,
                password: newHash
            }
        );

        res.status(200).json({
            success: true,
            message: "Coordinator updated successfully",
            data: updatedCoordinator
        });

    } catch (error) {
        console.error('Update coordinator error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Delete coordinator
adminRouter.delete('/delete-coordinator/:coordinatorId', adminAuth, async (req, res) => {
    try {
        const { coordinatorId } = req.params;

        // Check if coordinator exists
        const coordinator = await Coordinator.findById(coordinatorId);
        if (!coordinator) {
            return res.status(404).json({
                success: false,
                message: "Coordinator not found"
            });
        }

        // Update farmers to remove coordinator reference
        await Farmer.updateMany(
            { coordinatorId },
            { $unset: { coordinatorId: "" } }
        );

        // Delete coordinator
        await Coordinator.findByIdAndDelete(coordinatorId);

        res.status(200).json({
            success: true,
            message: "Coordinator deleted successfully"
        });

    } catch (error) {
        console.error('Delete coordinator error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});


// Add farmer
adminRouter.post('/add-farmer', adminAuth, async (req, res) => {
    try {
        // Validate input
        const validatedData = farmerSchema.safeParse(req.body);
        if (!validatedData.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validatedData.error.errors
            });
        }

        const { name, email, phoneNo, password, coordinatorId } = validatedData.data;

        // Check if farmer already exists
        const existingFarmer = await Farmer.findOne({
            $or: [{ email }, { phoneNo }]
        });

        if (existingFarmer) {
            return res.status(409).json({
                success: false,
                message: "Farmer already exists with this email or phone number"
            });
        }

        // Validate coordinator if provided
        if (coordinatorId) {
            const coordinator = await Coordinator.findById(coordinatorId);
            if (!coordinator) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid coordinator ID"
                });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create farmer
        const newFarmer = await Farmer.create({
            name,
            email,
            phoneNo,
            password: hashedPassword,
            coordinatorId,
        });

        // Update coordinator's farmers array if coordinator provided
        if (coordinatorId) {
            await Coordinator.findByIdAndUpdate(coordinatorId, {
                $push: { farmers: newFarmer._id }
            });
        }

        res.status(201).json({
            success: true,
            message: "Farmer added successfully",
            data: {
                id: newFarmer._id,
                name: newFarmer.name,
                email: newFarmer.email,
                coordinatorId: newFarmer.coordinatorId
            }
        });

    } catch (error) {
        console.error('Add farmer error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Update farmer
adminRouter.put('/update-farmer/:farmerId', adminAuth, async (req, res) => {
    try {
        const { farmerId } = req.params;
        const updateData = req.body;

        // Check if farmer exists
        const farmer = await Farmer.findById(farmerId);
        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found"
            });
        }

        // If updating coordinator
        if (updateData.coordinatorId) {
            const coordinator = await Coordinator.findById(updateData.coordinatorId);
            if (!coordinator) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid coordinator ID"
                });
            }

            // Remove farmer from old coordinator's list
            if (farmer.coordinatorId) {
                await Coordinator.findByIdAndUpdate(farmer.coordinatorId, {
                    $pull: { farmers: farmerId }
                });
            }

            // Add to new coordinator's list
            await Coordinator.findByIdAndUpdate(updateData.coordinatorId, {
                $push: { farmers: farmerId }
            });
        }

        // Update farmer
        const updatedFarmer = await Farmer.findByIdAndUpdate(
            farmerId,
            { $set: updateData },
            { new: true, select: '-password' }
        ).populate('coordinatorId', 'name email region');

        res.status(200).json({
            success: true,
            message: "Farmer updated successfully",
            data: updatedFarmer
        });

    } catch (error) {
        console.error('Update farmer error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Delete farmer
adminRouter.delete('/delete-farmer/:farmerId', adminAuth, async (req, res) => {
    try {
        const { farmerId } = req.params;

        // Check if farmer exists
        const farmer = await Farmer.findById(farmerId);
        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found"
            });
        }

        // Remove farmer from coordinator's list if assigned
        if (farmer.coordinatorId) {
            await Coordinator.findByIdAndUpdate(farmer.coordinatorId, {
                $pull: { farmers: farmerId }
            });
        }

        // Delete farmer
        await Farmer.findByIdAndDelete(farmerId);

        res.status(200).json({
            success: true,
            message: "Farmer deleted successfully"
        });

    } catch (error) {
        console.error('Delete farmer error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Get all payments
adminRouter.get("/payment-status", adminAuth, async (req, res) => {
    try {
      const payments = await paymentModel.find()
        .populate("userId", "name") 
        .sort({ paymentDate: -1 }); 

      res.status(200).json({
        success:true,
        message:payments.length ? "payments retrived successfully" : "no payment yet",
        payments
      });
    } catch (err) {
      console.log("Error fetching payments:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = adminRouter;