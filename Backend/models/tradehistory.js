import  mongoose  from "mongoose";
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Tradehistoryschema = new Schema({
    creater : {
        type : String,
        default : ""
    },
    spender : {
        type : String,
        default : "",
    },
    pay : {
        type : String,
        default : ""
    },
    receive : {
        type : String,
        default : ""
    },
    adminfee : {
        type : String,
        default : ""
    },
    perprice : {
        type : String,
        default : ""
    },
    orderid : {
        type : String,
        default : ""
    },
    chatref : {
        type : ObjectId,
    },
    status : {
        type : String,
        default : "pending"
    }
} , {timestamps : true});

// module.exports = mongoose.model('Tradehistory', Tradehistoryschema, 'Tradehistory');
const Tradehistory = mongoose.model("Tradehistory", Tradehistoryschema);

export default Tradehistory;