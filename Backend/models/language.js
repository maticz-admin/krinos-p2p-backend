// import package
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const LanguageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    isPrimary: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'Inactive'],
        default: "active",  //active, Inactive
    }
}, {
    timestamps: true
});

const Language = mongoose.model("language", LanguageSchema, 'language');

export default Language;