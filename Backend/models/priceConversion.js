// import package
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PriceConversionSchema = new Schema({
    baseSymbol: {
        type: String,
        default: ""
    },
    convertSymbol: {
        type: String,
        default: ""
    },
    tikerRoot: {
        type: String,
        default: ""
    },
    convertPrice: {
        type: Number,
        default: 0
    },
    change: {
        type: Number,
        default: 0
    },
    fetchstatus: {
		type: String,
		enum: ['off', 'binance', 'cryptocompare'],
		default: "off"	// off, binance
	},
}, {
    timestamps: true
});

const PriceConversion = mongoose.model("priceconversion", PriceConversionSchema, 'priceconversion');

export default PriceConversion;