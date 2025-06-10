// import package
import mongoose from "mongoose";

const Schema = mongoose.Schema;

let PreferredCurrencySchema = new Schema(
  {
    coin : {
        type : String,
        default : ""
    },
    showSymbol : {
        type : String,
        default : ""
    },
    image : {
        type : String,
        default : ""
    },
    status : {
        type : String,
        default : ""
    }
  },
  {
    timestamps: true,
  }
);

const PreferredCurrency = mongoose.model("preferredcurrency", PreferredCurrencySchema, "preferredcurrency");

export default PreferredCurrency;