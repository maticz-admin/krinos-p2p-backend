import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const messagenotificationschema = new Schema({
    userId: {
        type: ObjectId,
        ref: 'users',
    },
    roomid : {
        type : String,
        default : ""
    },
    title: {
        type: String,
        default: 0
    },
    description: {
        type: String,
        default: 0
    },
    sptitle : {
        type : String,
        default : ""
    },
    spdescription : {
        type : String,
        default : ""
    },
    isRead: {
        type: Boolean,
        default: false
    },
} , {timestamps : true});

const MessageNotification = mongoose.model("messagenotification" , messagenotificationschema);
export default MessageNotification;