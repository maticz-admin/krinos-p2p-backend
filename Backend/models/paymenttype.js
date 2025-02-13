
  // import package
  import mongoose from 'mongoose';



  const Schema = mongoose.Schema;
  const ObjectId = Schema.ObjectId;
  
  const paymenttypeSchema  = new Schema({
      Name:{
          type:String,
          default:''
        },
      label : {
        type:String,
          default:''
      },
      value : {
        type:String,
          default:''
      },
        // Description:{
        //   type:String,
        //   default:''
        // },
        status:{
          type:String,
          default:"Active"   //Active , Inactive
        },
  } , {timestamps : true});
  
  const PaymentTypes = mongoose.model("paymenttypeSchema", paymenttypeSchema);
  
  export default PaymentTypes;