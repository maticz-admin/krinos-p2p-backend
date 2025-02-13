// import package
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ReferChildSchema = new Schema({
    _id: {
        type: ObjectId,
        ref: 'user'
    },
    amount: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

const UserReferenceSchema = new Schema({
    _id: {
        type: ObjectId,
        ref: 'user',
    },
    referChild: [ReferChildSchema]
});

const UserReference = mongoose.model('userReference', UserReferenceSchema, 'userReference');
export default UserReference;