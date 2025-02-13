// import package
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

let LaunchpadSchema = new Schema({
	userId: {
		type: String,
		default: ''
	},
	currencyId: {
		type: ObjectId,
		ref: 'currency'
	},
	availableCoin: {
		type: [ObjectId],
		default: []
	},
	whitePaper: {
		type: String,
		required: true,
	},
	launchPrice: {
		type: Number,
		required: true,
	},
	launchCoin: {
		type: ObjectId,
		ref: 'currency'
	},
	minAmount: {
		type: Number,
		required: true,
	},
	discount: {
		type: Number,
		default: 0,
	},
	availableSupply: {
		type: Number,
		required: true,
	},
	maxSupply: {
		type: Number,
		required: true,
	},
	industry: {
		type: String,
		required: true,
	},
	website: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		default: ''
	},
	startTimeStamp: {
		type: Number,
		required: true
	},
	endTimeStamp: {
		type: Number,
		required: true
	},
	telegram: {
		type: String,
		default: ''
	},
	twitter: {
		type: String,
		default: ''
	},
	facebook: {
		type: String,
		default: ''
	},
	youtube: {
		type: String,
		default: ''
	},
	linkedIn: {
		type: String,
		default: ''
	},
}, {
	timestamps: true
});

const Launchpad = mongoose.model('launchpad', LaunchpadSchema, 'launchpad');
export default Launchpad;