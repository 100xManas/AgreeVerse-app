const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('../strategy/google');
const googleAuthRouter = express.Router();

// Google OAuth Login
googleAuthRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback
googleAuthRouter.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/signin' }),
    (req, res) => {
        // console.log("User in req:", req.user);
        // Setting up JWT 
        const user = req.user // Extract user and token

        // Generate JWT Token & Attach to user
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // console.log(user);
        // console.log(token);

        // Redirect user based on role
        const role = req.user.role.toLowerCase();

        // Ensure the role is correctly set in session
        req.session.role = role;

        // Client URL(Frontend => React)
        const CLIENT_URL = "http://localhost:5173"

        if (role === 'admin') return res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        }).redirect(`${CLIENT_URL}/${role}/dashboard`);

        if (role === 'coordinator') return res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        }).redirect(`${CLIENT_URL}/${role}/dashboard`);

        if (role === 'farmer') return res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        }).redirect(`${CLIENT_URL}/${role}/dashboard`);

        if (role === 'user') return res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        }).redirect(`${CLIENT_URL}/auth-success?user=true&role=${role}`);
    }
);

// Logout Route
googleAuthRouter.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = googleAuthRouter;