const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('../strategy/google');
const googleAuthRouter = express.Router();

// Google OAuth Login
googleAuthRouter.get('/google', (req, res, next) => {
    const { role, coordinatorId, adminId } = req.query;

    const state = JSON.stringify({
        role: role || 'user',
        coordinatorId: coordinatorId || null,
        adminId: adminId || null
    });

    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: state,
    })(req, res, next);
});


googleAuthRouter.get(
    '/google/callback',
    (req, res, next) => {
        passport.authenticate('google', (err, user, info) => {
            if (err) return res.redirect(`http://localhost:5173/auth-failure?error=${encodeURIComponent(err.message)}`);
            if (!user) return res.redirect(`http://localhost:5173/auth-failure?error=${encodeURIComponent(info.message)}`);

            const role = user.role;

            // Generate JWT Token
            const token = jwt.sign(
                { id: user._id, role },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            // Set the cookie and redirect
            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            }).redirect(`http://localhost:5173/auth-success?newUser=true&role=${role}`);
        })(req, res, next);
    }
);


// Logout Route
googleAuthRouter.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json(
                {
                    message: 'Logout failed'
                }
            );
        }
        res.clearCookie('token');
        res.redirect('/');
    });
});

module.exports = googleAuthRouter;