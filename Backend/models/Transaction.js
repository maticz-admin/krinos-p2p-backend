// import package
import mongoose from 'mongoose';

// import config
import config from '../config';

// import lib
import isEmpty from '../lib/isEmpty';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const TransactionSchema = new Schema({
	userId: {
		type: String,
		required: true
	},
	currencyId: {
		type: ObjectId,
		ref: 'currency',
	},
	coin: {
		type: String,
		default: ""
	},
	fromAddress: {
		type: String,
		default: ""
	},
	toAddress: {
		type: String,
		default: ""
	},
	destTag: {
		type: String,
		default: ""
	},
	amount: {
		type: Number,	// with commission fee
		default: 0
	},
	actualAmount: {
		type: Number,
		default: 0			// without Commission Fee
	},
	commissionFee: {
		type: Number,
		default: 0
	},
	coinpaymentsymbol : {
		type : String,
		default : ""
	},
	txid: {
		type: String,
	},
	status: {
		type: String,
		enum: ['new', 'time_expired', 'pending', 'completed', 'rejected', 'cancelled']
	},
	type: {
		type: String,
		enum: ['local', 'coin_payment', 'binance'],
		default: 'local'
	},
	paymentType: {
		type: String,
		enum: ['coin_deposit', 'coin_withdraw', 'coin_transfer', 'fiat_deposit', 'fiat_withdraw', 'fiat_transfer','fund',"local"],
		default: 'coin_deposit'
	},
	fromUserId: {
		type: ObjectId,
		default: null,
		ref: 'user',		// user to user transfer
	},
	toUserId: {
		type: ObjectId,
		default: null,
		ref: 'user',		// user to user transfer
	},
	bankDetail: {
		type: Object,
		default: null
	},
	image: {
		type: String,
		get: image => {
			if (isEmpty(image)) {
				return ''
			}
			return `${config.SERVER_URL}${config.IMAGE.DEPOSIT_URL_PATH}${image}`
		},
		default: "",
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

TransactionSchema.set('toObject', { getters: true });
TransactionSchema.set('toJSON', { getters: true });

const Transaction = mongoose.model("transaction", TransactionSchema, 'transaction');

export default Transaction;