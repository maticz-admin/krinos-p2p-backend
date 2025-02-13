// import package
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const TokenPurchaseSchema = new Schema({
	userId: {
		type: String,
		required: true
	},
	launchId: {
		type: ObjectId,
		ref: 'launchpad'
	},
	currencyId: {
		type: ObjectId,
		ref: 'currency'
	},
	coin: {
		type: String,
		required: true
	},
	price: {
		type: Number,
		default: 0
	},
	sendCoin: {
		type: String,
		required: true
	},
	quantity: {
		type: Number,
		default: 0
	},
	discount: {
		type: Number,
		default: 0
	},
	total: {
		type: Number,
		default: 0
	},
}, {
	timestamps: true
})

const TokenPurchase = mongoose.model('tokenpurchase', TokenPurchaseSchema, 'tokenpurchase');
export default TokenPurchase;