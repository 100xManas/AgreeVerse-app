const mongoose = require('mongoose');

const commonFields = {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, sparse: true },
    googleId: { type: String, unique: true }, // Store Google OAuth ID
    googleProfilePicture: { type: String },
    role: { type: String },
    createdAt: { type: Date, default: Date.now },
};

const adminSchema = new mongoose.Schema({ ...commonFields });

const coordinatorSchema = new mongoose.Schema({
    ...commonFields,
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
});

const farmerSchema = new mongoose.Schema({
    ...commonFields,
    coordinatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coordinator', required: true },
});

const userSchema = new mongoose.Schema({ ...commonFields });



const cropSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageURL: { type: String, required: true },
    tag: { type: String, enum: ['vegetable', 'fruit', 'grain'], required: true },
    price: { type: Number, required: true, min: 0 },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
    createdAt: { type: Date, default: Date.now }
});


const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    paymentId: { type: String, required: true, unique: true },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    amount: { type: Number },
    paymentDate: { type: Date, default: Date.now },
})

const userPurchasedCropSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    purchasedCrops: [{ type: mongoose.Types.ObjectId, ref: "Crop", required: true }],
    quantity: { type: Number },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
    deliveryAddress: {
        name: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        required: true
    },
    purchasedAt: { type: Date, default: Date.now },
});


const Admin = mongoose.model('Admin', adminSchema);
const Coordinator = mongoose.model('Coordinator', coordinatorSchema);
const Farmer = mongoose.model('Farmer', farmerSchema);
const User = mongoose.model('User', userSchema);

const cropModel = mongoose.model('Crop', cropSchema)
const userPurchasedCropModel = mongoose.model('PurchasedCrop', userPurchasedCropSchema)
const paymentModel = mongoose.model('Payment', paymentSchema)

module.exports = { Admin, Coordinator, Farmer, User, cropModel, userPurchasedCropModel, paymentModel };