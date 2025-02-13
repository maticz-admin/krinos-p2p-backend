// import package
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
let NewsLetterSchema = new Schema({
    email: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const NewLetter = mongoose.model('newsLetter', NewsLetterSchema, 'newsLetter');

export default NewLetter;