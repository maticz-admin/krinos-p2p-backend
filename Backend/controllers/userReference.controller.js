// import package
import mongoose from "mongoose";

// import modal
import { Transaction, User, UserReference } from "../models";

// import lib
import isEmpty from "../lib/isEmpty";

const ObjectId = mongoose.Types.ObjectId;

/**
 * Create New User Reference Modal
 */
export const newUsrReference = async (id) => {
  let newDoc = new UserReference({
    _id: id,
  });
const SaveDoc = await newDoc.save()
 return console.log();
  // newDoc.save((err, data) => {
  //   if (err) {
  //     return console.log();
  //   }
  //   return console.log();
  // });
};

/**
 * Add new child
 */
export const addChild = async (childDoc) => {
  try {
    if (isEmpty(childDoc)) {
      return false;
    }
    let parentDoc = await User.findOne({ userId: childDoc.referenceCode });
    if (!parentDoc) {
      return false;
    }
    await UserReference.findOneAndUpdate(
      {
        _id: parentDoc._id,
      },
      {
        $push: {
          referChild: {
            _id: childDoc._id,
            date: new Date(),
            amount: 0,
          },
        },
      },
      { upsert: true }
    );
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Referral History
 * URL : /api/referralHist
 * METHOD : GET
 */
export const referralHist =async (req, res) => {
  try{
  const UserReference = await UserReference.aggregate(
    [
      { $match: { _id: ObjectId(req.user.id) } },
      { $unwind: "$referChild" },
      {
        $lookup: {
          from: "user",
          localField: "referChild._id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          refEmail: "$userInfo.email",
          date: "$referChild.date",
          amount: "$referChild.amount",
        },
      },
    ])
      if (UserReference) {
       
          return res.status(200).json({ status: true, result: UserReference });
      }else{
        return res
        .status(500)
        .json({ status: false, message: "Something went wrong" });
      }
  }catch(err){
    return res
    .status(500)
    .json({ status: false, message: "Something went wrong" });
  }

};

export const transList = async (req, res) => {
  try {
    let datas = await User.findOne({ _id: req.user.id }, { userId: 1 });
    let checkdata = await Transaction.findOne(
      { userId: datas.userId },
      { paymentType: 1 }
    );
    return res.status(200).json({ status: true, result: checkdata });
  } catch (err) {
    return res.status(200).json({ status: true, result: {} });
  }
};

/**
 * User Referral History
 * URL : /adminapi/referralHist
 * METHOD : GET
 */
export const usrReferralHist = async (req, res) => {
  let reqBody = req.body;
  try{
 const UserReference = await UserReference.aggregate(
    [
      { $match: { _id: ObjectId(reqBody.id) } },
      { $unwind: "$referChild" },
      {
        $lookup: {
          from: "user",
          localField: "referChild._id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          refEmail: "$userInfo.email",
          date: "$referChild.date",
          amount: "$referChild.amount",
        },
      },
    ]);

   
      if (UserReference) {
        
      return res.status(200).json({ status: true, result: UserReference });
      }else{
      return res
          .status(500)
          .json({ status: false, message: "Something went wrong" });
      }
    }catch(err){
      return res
          .status(500)
          .json({ status: false, message: "Something went wrong" });
    }
};
