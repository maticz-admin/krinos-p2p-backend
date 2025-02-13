// import package
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const AssetsSchema = new Schema({
	_id: {
		type: ObjectId,   // Currency Id
		ref: 'currency'
	},
	coin: {
		type: String,
		default: '',
	},
	address: {
		type: String,
		default: '',
	},
	destTag: {
		type: String,   // For XRP Currency
		default: ''
	},
	privateKey: {
		type: String,
		default: '',
	},
	spotBal: {
		type: Number,   // Spot Balance
		default: 0
	},
	derivativeBal: {	// Derivative Balance
		type: Number,
		default: 0
	},
	p2pBal: {
		type: Number,
		default: 0
	}
});


const walletSchema = new Schema({
	_id: {
		type: ObjectId,  // Ref. to user collection _id
		required: true,
		ref: 'user'
	},
	userId: {
		type: String,
		unique: true,
		required: true
	},
	binSubAcctId: {      // Binance Sub Account Id
		type: String,
		default: ''
	},
	hideZeroStatus: {
		type: Boolean,
		default: false,
	},
	assets: [AssetsSchema]
}, {
	timestamps: true
});

const wallet = mongoose.model('wallet', walletSchema, 'wallet');

export default wallet;