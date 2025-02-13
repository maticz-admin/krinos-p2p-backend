// import package
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const anouncementSchema = new Schema({
    endDateTime: {
        type: Date,
        default: ""
    },
    content: {
        type: String,
        default: ""
    },
    image:{
        type:String,
        default:""
    }

}, {
    timestamps: true
});

const Anouncement = mongoose.model("anouncement", anouncementSchema, 'anouncement');

export default Anouncement;