const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

dotenv.config();

const { userRouter } = require('./routes/user')
const adminRouter = require('./routes/admin')
const coordinatorRouter = require('./routes/coordinator');
const { farmerRouter } = require('./routes/farmer');
const googleAuthRouter = require('./routes/googleAuth')
const paymentRouter = require('./routes/payment')
const { router } = require('./middleware/auth')

const app = express();
app.use(cookieParser())

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: 'https://agreeverse-app.onrender.com',
    credentials: true
}));

//Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || "100xManas",
    resave: true,
    saveUninitialized: false
}))

//Initialize passport
app.use(passport.initialize())
app.use(passport.session())

// Use the authentication routes
app.use('/auth', googleAuthRouter);

app.use('/api/v1/user', userRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/coordinator', coordinatorRouter)
app.use('/api/v1/farmer', farmerRouter)

app.use('/api/v1', paymentRouter)

app.use('/api/v1', router)

//connect to mongoDB and start the server
async function main() {
    try {
        await mongoose.connect(process.env.CONN_STRING)
        console.log('Connected to MongoDB');
    } catch (err) {
        return console.log("Error! while connecting BD " + err);
        process.exit(1); // Exit
    }

    app.listen(process.env.PORT, () => `Server running on port ${process.env.PORT}`)
}
main()