const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const P2pPostSchema = new Schema({
    userId: {
        type: ObjectId,
        required: true,
        ref: "user",
    },
    pairId: {
        type: ObjectId,
        required: true,
        ref: 'p2ppair',
    },
    pairName: {
        type: String,
        required: true,
        default: ''
    },
    firstCoinId: {
        type: ObjectId,
        required: true,
        ref: 'currency'
    },
    firstCoin: {
        type: String,
        required: true,
        default: '',
    },
    secondCoinId: {
        type: ObjectId,
        required: true,
        ref: 'currency'
    },
    secondCoin: {
        type: String,
        required: true,
        default: '',
    },
    price: {
        type: Number,
        default: 0,
        required: true
    },
    quantity: {
        type: Number,
        default: 0,
        required: true
    },
    filledQuantity: {
        type: Number,
        default: 0,
        required: true
    },
    minLimit: {
        type: Number,
        default: 0,
    },
    maxLimit: {
        type: Number,
        default: 0,
    },
    initialMinLimit: {
        type: Number,
        default: 0,
    },
    initialMaxLimit: {
        type: Number,
        default: 0,
    },
    markPrice: {
        type: Number,
        default: 0
    },
    side: {
        type: String,
        enum: ['buy', 'sell'],
        required: true,
    },
    feePct: {
        type: Number,    //Commission Fee in Percentage
        default: 0
    },
    postId: {
        type: String,
        required: true,
        unique: true
    },
    orderDate: {
        type: Date,
        default: Date.now(),
    },
    endDate: {
        type: Date,
        default: Date.now
    },
    payBy: {
        type: String,
        default: '',
    },
    terms: {
        type: String,
    },
    transferMode: {
        type: String,
        default: '',
    },
    paymentDetail: {
        type: String,
        default: "",
    },

    status: {
        type: String,
        required: true,
        enum: ['open', 'pending', 'completed', 'closed','cancelled'],
        default: 'open', //0-new, 1-completed, 2-partial, 3- Cancel, 4- Conditional
    },




    /* ********************************************** */

    prefcurrencytransfer: [
        {
            bank: {
                type: String,
                default: "",
            },
        },
    ],
});

const P2pPost = mongoose.model("p2pPost", P2pPostSchema, "p2pPost");

export default P2pPost;