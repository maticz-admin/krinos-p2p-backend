// import package
import mongoose from 'mongoose'

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ClosedPositionSchema = new Schema({
	userId: {
		type: ObjectId,
		ref: 'users'
	},
	pairId: {
		type: ObjectId,
		ref: 'perpetual'
	},
	pairName: {
		type: String,
		default: ''
	},
	entryPrice: {
		type: Number,
		default: 0
	},
	exitPrice: {
		type: Number,
		default: 0
	},
	quantity: {
		type: Number,
		default: 0
	},
	closingDirection: {
		type: String,
	},
	profitLoss: {
		type: Number,
		default: 0
	},
	exitType: {
		type: String,
		default: "trade"
	},
	orderCost: {
		type: Number,
		default: 0
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
});

const ClosedPosition = mongoose.model('closedposition', ClosedPositionSchema, 'closedposition');

export default ClosedPosition