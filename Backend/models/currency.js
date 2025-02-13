// import package
import mongoose from "mongoose";

const Schema = mongoose.Schema;

let CurrencySchema = new Schema(
  {
    name: {
      type: String,
      default: "",
    },
    coin: {
      type: String,
      unique: true,
      // required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    coinpaymentsymbol : {
      type : String,
      required : true
    },
    image: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["crypto", "token", "fiat" , "preferedcurrency"],
      default: "crypto", // crypto, token, fiat
    },
    withdrawFee: {
      type: Number, //percentage
      default: 0,
    },
    minimumWithdraw: {
      type: Number,
      default: 0,
    },
    fundLimit: {
      // hrs
      type: Number,
      default: 0,
    },
    fundInterval: {
      // hrs
      type: Number,
      default: 0,
    },
    fundFee: {
      type: Number, // percentage
      default: 0,
    },
    decimal: {
      // token
      type: Number,
      default: 0,
    },
    bankDetails: {
      //fiat
      bankName: {
        type: String,
        default: "",
      },
      accountNo: {
        type: String,
        default: "",
      },
      holderName: {
        type: String,
        default: "",
      },
      bankcode: {
        type: String,
        default: "",
      },
      country: {
        type: String,
        default: "",
      },
    },
    tokenType: {
      // token
      type: String,
      enum: ["", "erc20", "trc20", "bep20"],
      default: "",
    },
    minABI: {
      // token
      type: String,
      default: "",
    },
    contractAddress: {
      // token
      type: String,
      default: "",
    },
    contractDecimal: {
      // token
      type: Number,
      default: 0,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    depositType: {
      type: String,
      enum: ["local", "coin_payment", "binance", "none"],
      default: "binance", //'local', 'coin_payment', 'binance', 'none'
    },
    depositminlimit: {
      type: Number,
      default: 0,
    },
    depositStatus: {
      type: String,
      default: "On", //'local', 'coin_payment', 'binance', 'none'
    },
    withdrawStatus: {
      type: String,
      default: "On", //'local', 'coin_payment', 'binance', 'none'
    },
    block: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "Inactive"],
      default: "active",
    },
    commisionfee : {
      type : String,
      default : ""
    },
    api : {
      type : String,
      default : ""
    },
    key : {
      type : String,
      default : ""
    }
  },
  {
    timestamps: true,
  }
);

const Currency = mongoose.model("currency", CurrencySchema, "currency");

export default Currency;
