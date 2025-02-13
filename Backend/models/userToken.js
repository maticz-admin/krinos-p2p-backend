// import package
import mongoose from 'mongoose'

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userToken = new Schema({
    userId: {
        type: ObjectId,
        ref: 'user',
        required: true,
        unique: true,
    },
    userCode: {
        type: String,
        unique: true,
        required: true,
    },
    token: {
        type: String,
        required: true
    },
    tokenId: {
        type: ObjectId,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

userToken.index({ userId: 1, token: 1 }); // schema level

const UserToken = mongoose.model("userToken", userToken, "userToken");

export default UserToken