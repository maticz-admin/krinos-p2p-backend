import mongoose from "mongoose";

const ObjectId = mongoose.Schema.ObjectId;

const createorderschema = new mongoose.Schema({
    coin : {
        type : String,
        default : ""
    },
    ordertype : {
        type : String,
        default : ""
    },
    paymentmethod : {
        type : Array,
        default : []
    },
    preferedcurrency : {
        type : String,
        default : ""
    },
    orderid : {
        type : String,
        default : "",
        unique : true
    },
    ownerid : {
        type : ObjectId,
    },
    spenderid : {
        type : Array,
        default : []
    },
    country : {
        type : String,
        default : ""
    },
    pricetype : {
        type : String,
        default : 0
    },
    min : {
        type : Number,
        default : 0
    },
    max : {
        type : Number,
        default : ""
    },
    offermargin : {
        type : String,
        default : ""
    },
    fixedmarketrate : {
        type : String,
        default : ""
    },
    offertimelimit : {
        type : String,
        default : ""
    },
    offertags : {
        type : Array,
        default : []
    },
    yourofferlable : {
        type : String,
        default : ""
    },
    offerterms : {
        type : String,
        default : ""
    },
    tradeinstruction : {
        type : String,
        default : ""
    },
    verifiyid : {
        type : Boolean,
        default : false
    },
    verifiyfullname : {
        type : Boolean,
        default : false
    },
    createrid : {
        type : String,
        default : ""
    },
    views : {
        type : Number,
        default : 0
    },
    offerstatus : {
        type : String,
        default : "created"
    }
},
{
    timestamps : true
});

const p2pcreateOrder = mongoose.model("p2pcreateOrder", createorderschema, "p2pcreateOrder");
export default p2pcreateOrder;