// import package
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const chatSchema = new Schema({
  senderId: {
    type: ObjectId,
    ref: 'user',
  },
  receiverId: {
    type: ObjectId,
    ref: 'user',
  },
  admin: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: "",
  },
  readStatus: {
    type: Boolean,
    default: false,
  },
  attachment: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },

  /* ************************* */
  status: {
    type: String,
    default: "1", // 1 for Active
  },


  updated_at: {
    type: Date,
    default: Date.now,
  },
  cancelReason: {
    type: String,
    default: "",
  },
});



const P2pOrderSchema = new Schema({
  postId: {
    type: ObjectId,
    required: true,
    ref: 'p2pPost',
  },
  buyUserId: {
    type: ObjectId,
    required: true,
    ref: 'user',
  },
  buyUniqueId: {
    type: String,
    default: ''
  },
  sellUserId: {
    type: ObjectId,
    required: true,
    ref: 'user',
  },
  sellUniqueId: {
    type: String,
    default: ''
  },
  firstCoinId: {
    type: ObjectId,
    required: true,
    ref: 'currency'
  },
  firstCoin: {
    type: String,
    required: true,
    default: '',
  },
  secondCoinId: {
    type: ObjectId,
    required: true,
    ref: 'currency'
  },
  secondCoin: {
    type: String,
    required: true,
    default: '',
  },
  payValue: {
    type: Number,
    default: 0,
  },
  receiveValue: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    default: 0,
  },
  side: {
    type: String,
    enum: ['buy', 'sell'],
    required: true,
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  feePct: {
    type: Number,    //Commission Fee in Percentage
    default: 0
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  payBy: {
    type: String,
    default: '',
  },
  chat: [chatSchema],
  status: {
    type: String,
    required: true,
    enum: ['open', 'pending', 'paid', 'completed', 'disputed', 'closed', 'cancelled', 'dispute'],
    default: 'open',
  },
  disputeStatus: {
    type: String,
    required: true,
    enum: ['open', 'closed', 'resolved'],
    default: 'closed',
  },
  disputeDate: {
    type: Date,
    default: new Date(),
  },
  disputeRaisedBy: {
    type: String,
    enum: ['none', 'buy', 'sell'],
    default: "none"
  },
  disputeTo: {
    type: String,
    enum: ['none', 'buy', 'sell'],
    default: "none"
  }
}, {
  timestamps: true
});

const p2pOrder = mongoose.model("p2pOrder", P2pOrderSchema, "p2pOrder");
export default p2pOrder;