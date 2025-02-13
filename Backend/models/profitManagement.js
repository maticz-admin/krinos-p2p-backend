// import package
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const AdminProfitSchema = new Schema({
    userId: {
        type: String,
        required: true,
        default: ''
    },
    coinId: {
        type: ObjectId,
        ref: 'currency'
    },
    coin: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        enum: ['spot', 'derivative', 'p2p', 'withdraw'],
        default: ""
    },
    fee: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});

const AdminProfit = mongoose.model("adminProfit", AdminProfitSchema, 'adminProfit');

export default AdminProfit;