// import package
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const stakingSchema = new Schema({
	currencyId: {
		type: ObjectId,
		ref: 'currency'
	},
	minimumAmount: {
		type: Number,
		default: 0
	},
	maximumAmount: {
		type: Number,
		default: 0
	},
	redemptionPeriod: {			// In days
		type: Number,
		default: 1
	},
	type: {
		type: [String],
		enum: ['fixed', 'flexible']   // flexible, fixed
	},
	periodList: [{		// In Fixed (locked)
		days: {
			type: String,
			default: ''
		},
		APY: {		// annual percentage yieldi in percentage
			type: Number,
			default: ''
		},
	}],

	flexibleAPY: {
		type: Number,
		default: 0
	},
	settlementPeriod: {			//	In days
		type: Number,
		default: 1
	},
	status: {
		type: String,		// active, Inactive
		default: 'active'
	},
});

const Staking = mongoose.model('staking', stakingSchema, 'staking');

export default Staking;