// import package
import mongoose from 'mongoose';

// import config
import config from '../config';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserKycSchema = new Schema({
    userId: {
        type: ObjectId,
        required: true,
        unique: true
    },
    idProof: {
        type: {
            type: String,
            default: ''    // Passport, Driving Licence, National Security Card
        },
        proofNumber: {
            type: String,
            default: ''
        },
        frontImage: {
            type: String,
            default: ''
        },
        backImage: {
            type: String,
            default: ''
        },
        selfiImage: {
            type: String,
            default: ''
        },
        panImage: {
            type: String,
            default: ''
        },
        reason: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            default: 'new'     // new, pending, approved, rejected
        },
    },
    addressProof: {
        type: {
            type: String,
            default: ''    // Passport, Driving Licence, National Security Card
        },
        frontImage: {
            type: String,
            default: ''
        },
        reason: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            default: 'new'     // new, pending, approved, rejected
        },
    },
    selfiId: {
        frontImage: {
            type: String,
            default: ''
        },
        reason: {
            type: String,
            default: ''
        },
        status: {
            type: Number,
            default: 1     // 1-new, 2-pending, 3-approved, 4-rejected
        },
    },
    bankProof: {
        type: {
            type: String,
            default: 1    // 1-Bank Passbook, 2-Bank statement
        },
        frontImage: {
            type: String,
            default: ''
        },
        reason: {
            type: String,
            default: ''
        },
        status: {
            type: Number,
            default: 1    // 1-new, 2-pending, 3-approved, 4-rejected
        },
    },

    status : {
        type : String,
        default : "Not Started"  //Pending , Approved , Rejected
    },
    sessionId : {
        type : String,
        default : ""
    }
}, {
    timestamps: true
})

const UserKyc = mongoose.model("userkycs", UserKycSchema);

export default UserKyc;