const jwt = require('jsonwebtoken');
const { User, Admin, Coordinator, Farmer } = require('../models/db');

async function userAuth(req, res, next) {
    try {
        const token = req.cookies.token;

        if (!token) {
            throw new Error('Authentication required');
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);

        // Assuming User is your default model
        const user = await User.findOne({ _id: decodedData.id });
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Attach user to request for later use
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({
            error: 'Authentication failed',
            details: err.message
        });
    }
}

async function adminAuth(req, res, next) {
    try {
        const token = req.cookies.token;

        if (!token) {
            throw new Error('Authentication required');
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findOne({ _id: decodedData.id });
        if (!admin) {
            return res.status(404).send("Admin not found");
        }

        req.admin = admin;
        next();
    } catch (err) {
        res.status(401).json({
            error: 'Authentication failed',
            details: err.message
        });
    }
}

async function coordinatorAuth(req, res, next) {
    try {
        const token = req.cookies.token;

        if (!token) {
            throw new Error('Authentication required');
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        const coordinator = await Coordinator.findOne({ _id: decodedData.id });
        if (!coordinator) {
            return res.status(404).send("Coordinator not found");
        }

        req.coordinator = coordinator;
        next();
    } catch (err) {
        res.status(401).json({
            error: 'Authentication failed',
            details: err.message
        });
    }
}

async function farmerAuth(req, res, next) {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).send("Unauthorized");
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        const farmer = await Farmer.findOne({ _id: decodedData.id });
        if (!farmer) {
            return res.status(404).send("Farmer not found");
        }

        req.farmer = farmer;
        next();
    } catch (err) {
        res.status(401).json({
            success: false,
            message: "Unauthorized",
            details: err.message
        });
    }
}

module.exports = {
    userAuth,
    adminAuth,
    coordinatorAuth,
    farmerAuth
};