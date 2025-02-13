const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const msgschema = new Schema({
    from : {
        type : String,
        default : ""
    },
    to : {
        type : String,
        default : ""
    },
    message : {
        type : String,
        default : ""
    },
    seen : {
        type : Boolean,
        default : false
    },
    time : {
        type : String,
        default : ""
    },
    image : {
        type : String,
        default : ""
    }
})

const chatorderSchema = new Schema({
    ordercreator : {
        type : String,
        default : ""
    },
    spender : {
        type : String,
        default : ""
    },
    message : {
        type : [msgschema] ,
        default : []
    },
    // {
    //     type : Array,
    //     default : []
    // },
    roomid : {
        type : String,
        default : "",
        unique : true
    },
    orderid : {
        type : String,
        default : ""
    },
    chatstatus : {
        type : String,      //Active , Inactive
        default : "Active"
    },
    requestview : {
        type : Boolean,
        default : false
    },
    orderstarttime : {
        type : String,
        default : ""
    },
    paidstatus : {
        type : String,
        default : "pending"
    },
    orderendtime : {
        type : String,
        default : ""
    }
} , {timestamps : true});

const Orderchat = mongoose.model("Orderchat", chatorderSchema);

module.exports = Orderchat;