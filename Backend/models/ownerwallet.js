import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ownerSchema = new Schema({
    type : {
        type : String,
        default : "WALLET"
    },
    privatekey : {
        type : String,
        default : "",
    },
    walletaddress : {
        type : String,
        default : ""
    }
} , {timestamps : true});

const OwnerWallet = mongoose.model("ownerwallet" , ownerSchema);

export default OwnerWallet;