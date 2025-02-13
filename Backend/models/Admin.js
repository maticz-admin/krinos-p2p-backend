// import package
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// import lib
import config from '../config';

const Schema = mongoose.Schema;

const RestrictionSchema = new Schema({
    _id: 0,
    // name: {
    //     type: String,
    //     default: ""
    // },
    path: {
        type: String,
        default: ""
    },
    isWriteAccess: {
        type: Boolean,
        default: false
    }
});

const AdminSchema = new Schema({
    name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['superadmin', 'admin'],  // super admin access all, admin - restricted
    },
    restriction: [],
    google2Fa: {
        secret: {
            type: String,
            default: ""
        },
        uri: {
            type: String,
            default: ""
        },
    },
    otp: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    otpTime: {
        type: Date,
    },
})

AdminSchema.methods.generateJWT = function (payload) {
    var token = jwt.sign(payload, config.secretOrKey);
    return `Bearer ${token}`;
};


const Admin = mongoose.model("admins", AdminSchema);

export default Admin;