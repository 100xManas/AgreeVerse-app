const passport = require('passport');
const dotenv = require('dotenv')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Admin, Coordinator, Farmer, User } = require('../models/db');

dotenv.config()

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        passReqToCallback: true, // Allow access to request
    },
    async (req, accessToken, refreshToken, profile, done) => {
        try {
            const { id, displayName, emails, photos } = profile;
            const email = emails[0].value;
            const picture = photos?.[0]?.value || null

            // Default values
            let role = "user";
            let coordinatorId = null;
            let adminId = null;

            // Check for state in query
            if (req.query.state) {
                try {
                    const state = JSON.parse(req.query.state);
                    role = state.role || "user";
                    coordinatorId = state.coordinatorId;
                    adminId = state.adminId;
                } catch (error) {
                    console.error('Error parsing state:', error);
                }
            }

            // Check if user exists in any collection
            const adminUser = await Admin.findOne({ email });
            const coordinatorUser = await Coordinator.findOne({ email });
            const farmerUser = await Farmer.findOne({ email });
            const generalUser = await User.findOne({ email });

            // Determine which collection the user exists in
            if (adminUser) {
                return done(null, false, { message: 'User already exists in Admin collection' });
            }
            if (coordinatorUser) {
                return done(null, false, { message: 'User already exists in Coordinator collection' });
            }
            if (farmerUser) {
                return done(null, false, { message: 'User already exists in Farmer collection' });
            }
            if (generalUser) {
                return done(null, false, { message: 'User already exists in User collection' });
            }

            // If no existing user, create new user
            const newUser = {
                name: displayName,
                email: email,
                googleId: id,
                googleProfilePicture: picture,
                role,
            };

            // Add coordinatorId for new farmers
            if (role === 'farmer' && coordinatorId) {
                newUser.coordinatorId = coordinatorId;
            }

            // Add adminId for new coordinators
            if (role === 'coordinator' && adminId) {
                newUser.adminId = adminId;
            }

            // Create user in appropriate collection
            let user;
            if (role === 'admin') user = await Admin.create(newUser);
            else if (role === 'coordinator') user = await Coordinator.create(newUser);
            else if (role === 'farmer') user = await Farmer.create(newUser);
            else user = await User.create(newUser);

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
));

// Serialize User
passport.serializeUser((user, done) => {
    done(null, { id: user._id, role: user.constructor.modelName });
});

// Deserialize User (Retrieve data)
passport.deserializeUser(async (obj, done) => {
    const { id, role } = obj;

    const Model = role === 'Admin' ? Admin
        : role === 'Coordinator' ? Coordinator
            : role === 'Farmer' ? Farmer
                : User; // Default to User

    try {
        const user = await Model.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;