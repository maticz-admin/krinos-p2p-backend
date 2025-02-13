
  // import package
import mongoose from 'mongoose';



const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const OfferTagSchema  = new Schema({
    Name:{
        type:String,
        default:''
      },
      Description:{
        type:String,
        default:''
      },
      status:{
        type:Boolean,
        default:true
      },
      createdAt: {
        type: Date,
        default: Date.now
     },
    
})

const OfferTag = mongoose.model("OfferTagSchema", OfferTagSchema);

export default OfferTag;