import mongoose from "mongoose";
 
/** Global-Usage */
const Schema = mongoose.Schema;
 
const VerificationSchema = new Schema({
    phoneNo: {
        type: String,
        default: ''
    },
    phoneCode : {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'unVerified'
    },
    
    otp : {
        type: String,
        default: 'unVerified'
    },
    otptime: {
        type: Date,
        default: ''
  }
 
}, { timestamps: true });
 
 
const Verification = mongoose.model("verification", VerificationSchema, 'verification');
 
export default Verification;