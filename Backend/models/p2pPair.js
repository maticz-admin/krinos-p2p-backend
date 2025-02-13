// import package
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const P2pPairSchema = new Schema({
    tikerRoot: {
        type: String,
        required: true,
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
    markPrice: {
        type: Number,
        default: 0
    },
    feePct: {
        type: Number,    //Commission Fee in Percentage
        default: 0
    },
    markupPercentage: {
        type: Number,
        default: 0
    },
    fetchMarkPrice: {
        type: String,
        enum: ['local', 'binance'],
        default: 'local'
    },
    duration: {   // Second
        type: Number,
        default: 1800
    },
    payment: {
        type: Array,
        default: []
    },
    status: {
        type: String,
        enum: ['active', 'Inactive'],
        default: "active",  //active, Inactive
    },


    /* ***************************************************** */


    // tiker_root: {
    //     type: String
    //     /*required:true,
    //     index: true */
    // },
    // transactionfee: {
    //     type: String,
    //     default: ''
    // },
    // index_price: {
    //     type: String,
    //     default: ''   //index price
    // },
    // mark_price: {
    //     type: String,
    //     default: '' //market price
    // },

    // maxquantity: {
    //     type: String,
    //     default: ''
    // },
    // minquantity: {
    //     type: String,
    //     default: ''
    // },

    // first_currency: {
    //     type: String,
    //     default: '',
    //     index: true
    // },
    // second_currency: {
    //     type: String,
    //     default: '',
    //     index: true
    // },
    // status: {
    //     type: Number,
    //     default: 0
    // }
});

const P2pPair = mongoose.model("p2ppair", P2pPairSchema, 'p2ppair');

export default P2pPair;