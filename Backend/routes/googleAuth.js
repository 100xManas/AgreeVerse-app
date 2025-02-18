const express = require('express');
const passport = require('../strategy/google');
const googleAuthRouter = express.Router();

// Google OAuth Login
googleAuthRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback
googleAuthRouter.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Redirect user based on role
        const role = req.user.constructor.modelName.toLowerCase();
        
        // Ensure the role is correctly set in session
        req.session.role = role; // Or handle it in another way

        if (role === 'admin') return res.redirect('/admin/dashboard');
        else if (role === 'coordinator') return res.redirect('/coordinator/dashboard');
        else if (role === 'farmer') return res.redirect('/farmer/dashboard');
        else return res.redirect('/user/dashboard'); // Default: User dashboard
    }
);

// Logout Route
googleAuthRouter.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = googleAuthRouter;