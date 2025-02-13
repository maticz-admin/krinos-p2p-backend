// import package
const mongoose = require("mongoose");
import jwt from "jsonwebtoken";
var crypto = require('crypto');

// import config 
import config from '../config';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const BankDetailsSchema = new Schema({
  bankName: {
    type: String,
    default: ""
  },
  accountNo: {
    type: String,
    default: ""
  },
  holderName: {
    type: String,
    default: ""
  },
  bankcode: {
    type: String,
    default: ""
  },
  country: {
    type: String,
    default: ""
  },
  city: {
    type: String,
    default: ""
  },
  bankAddress: {
    type: String,
    default: ""
  },
  currencyId: {
    type: ObjectId,
  },
  currencySymbol: {
    type: String,
    default: ""
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
});

const Review = new Schema({
  reviewtype : {
    type : String,
    default : ""
  },
  userid : {
    type : String,
    default : ""
  },
  description : {
    type : String,
    default : ""
  },
  date : {
    type : String,
    default : ""
  }
})

const UserSchema = new Schema({
  userId: {
    type: String,
    unique: true,
    required: true
  },
  editProfile: {
    type: String,
    default: 'false'
  },
  firstName: {
    type: String,
    default: ""
  },
  lastName: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    default: ''
  },
  phoneCode: {
    type: String,
    default: ""
  },
  phoneNo: {
    type: String,
    default: ""
  },
  otp: {
    type: String,
    default: ""
  },
  otptime: {
    type: Date,
    default: ''
  },
  newEmail: {
    type: String,
    default: ""
  },
  newEmailToken: {
    type: String,
    default: ""
  },
  newPhone: {
    phoneCode: {
      type: String,
      default: ""
    },
    phoneNo: {
      type: String,
      default: ""
    },
  },
  hash: {
    type: String,
  },
  salt: {
    type: String,
  },
  blockNo: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  postalCode: {
    type: String,
    default: ''
  },
  google2Fa: {
    secret: {
      type: String,
      default: ""
    },
    uri: {
      type: String,
      default: ""
    },
  },
  emailStatus: {
    type: String,
    default: "unverified" //    default: 'unverified' //unverified, verified
  },
  phoneStatus: {
    type: String,
    default: "unverified" //    default: 'unverified' //unverified, verified
  },
  profileImage: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['not_activate', 'basic_pending', 'basic_submitted', 'basic_verified', 'advanced_pending', 'advanced_verified', 'pro_pending', 'pro_verified'],
    default: 'basic_pending' //not_activate, basic, advanced, pro
  },
  mailToken: {
    type: String,
    default: "" //
  },
  level : {
    type : String,
    default : "0"
  },
  referralCode: {
    type: String,
    default: ""
  },
  referenceCode: {
    type: String,
    default: ""
  },
  bankDetails: [BankDetailsSchema],
  reviews : [Review],
  binSubAcctId: {      // Binance Sub Account Id
    type: String,
    default: ''
  },
  binSubAcctEmail: {  // Binance Sub Account Email
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'unverified' //unverified, verified
  },
  createdAt: {
    type: Date,
    default: Date.now
  },

  /* ------------------------ */




  role: {
    type: String,
    default: "user"
  },
  lastseen : {
    type : String,
    default : ""
  },

  referaluserid: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },




  loginhistory: [{
    countryCode: {
      type: String,
      default: ''
    },
    countryName: {
      type: String,
      default: ''
    },
    regionName: {
      type: String,
      default: ''
    },
    ipaddress: {
      type: String,
      default: ''
    },
    broswername: {
      type: String,
      default: ''
    },
    ismobile: {
      type: String,
      default: ''
    },
    os: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'Success' // success / failure
    },
    createdDate: {
      type: Date,
      default: Date.now// success / failure
    },

  }],

  useractive : {
    type : Boolean,
    default : false
  },
  lastseen : {
    type : String,
    default : ""
  }

});

// UserSchema.virtual('id').get(function () {
//   return this._id.toHexString();
// });

// UserSchema.set('toJSON', {
//   virtuals: true
// });

/**
 * Pre-save hook
 */
UserSchema.pre('save', function (next) {
  if (!this.isNew) return next();

  // if (!validatePresenceOf(this.hash))
  //   next(new Error('Invalid password'));
  // else
    next();
});

var validatePresenceOf = function (value) {
  return value && value.length;
};

// Validate empty password
// UserSchema
//   .path('hash')
//   .validate(function (hashedPassword) {
//     return hashedPassword.length;
//   }, 'Password cannot be blank');


/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hash = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hash;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function () {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function (password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 100000, 128, 'sha512').toString('base64');
  }
};

UserSchema.methods.generateJWT = function (payload) {
  var token = jwt.sign(payload, config.secretOrKey);
  return `Bearer ${token}`;
};
UserSchema.methods.decodejwt = function (data) {
  var decode = jwt.verify(data, config.secretOrKey);
  return decode ;
};




UserSchema.virtual('wallet', {
  ref: 'wallet',
  localField: 'userId',
  foreignField: 'userId',
  justOne: true
});

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });

const User = mongoose.model("user", UserSchema, 'user');

module.exports = User;
