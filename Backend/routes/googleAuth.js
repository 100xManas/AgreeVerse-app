const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('../strategy/google');
const googleAuthRouter = express.Router();

// googleAuthRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Login
googleAuthRouter.get('/google', (req, res, next) => {
    const { role, coordinatorId, adminId } = req.query;

    const state = JSON.stringify({
        role: role || 'user',
        coordinatorId: coordinatorId || null,
        adminId:adminId || null
    });

    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: state,
    })(req, res, next);
});

// Google OAuth Callback
// googleAuthRouter.get('/google/callback',
//     passport.authenticate('google', { failureRedirect: 'http://localhost:5173/signin' }),
//     (req, res) => {

//         const user = req.user;
//         // console.log('Authenticated User in googleAuth => ', user);

//         const role = user.role;

//         // Generate JWT Token with the correct role
//         const token = jwt.sign(
//             {
//                 id: user._id,
//                 role: role
//             },
//             process.env.JWT_SECRET,
//             { expiresIn: "1d" }
//         );

//         // Client URL(Frontend => React)
//         const CLIENT_URL = "http://localhost:5173"

//         res.cookie('token', token, {
//             httpOnly: true,
//             secure: false,
//             sameSite: 'lax',
//             maxAge: 24 * 60 * 60 * 1000
//         }).redirect(`${CLIENT_URL}/auth-success?newUser=true&role=${role}`);


//         // if (role === 'admin') return res.cookie('token', token, {
//         //     httpOnly: true,
//         //     secure: false,
//         //     sameSite: 'lax',
//         //     maxAge: 24 * 60 * 60 * 1000
//         // }).redirect(`${CLIENT_URL}/auth-success?newUser=true&role=${role}`);

//         // if (role === 'coordinator') return res.cookie('token', token, {
//         //     httpOnly: true,
//         //     secure: false,
//         //     sameSite: 'lax',
//         //     maxAge: 24 * 60 * 60 * 1000
//         // }).redirect(`${CLIENT_URL}/auth-success?newUser=true&role=${role}`);

//         // if (role === 'farmer') return res.cookie('token', token, {
//         //     httpOnly: true,
//         //     secure: false,
//         //     sameSite: 'lax',
//         //     maxAge: 24 * 60 * 60 * 1000
//         // }).redirect(`${CLIENT_URL}/auth-success?newUser=true&role=${role}`);

//         // if (role === 'user') return res.cookie('token', token, {
//         //     httpOnly: true,
//         //     secure: false,
//         //     sameSite: 'lax',
//         //     maxAge: 24 * 60 * 60 * 1000
//         // }).redirect(`${CLIENT_URL}/auth-success?newUser=true&role=${role}`);
//     }
// );

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