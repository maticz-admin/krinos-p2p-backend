// import package
import multer from "multer";
import path from "path";

// import model
import { Currency } from "../models";

// import config
import config from "../config";

// import controller
import { addPriceCNV } from "./priceCNV.controller";
import { newAssetAllUsr } from "./wallet.controller";

// import lib
import imageFilter from "../lib/imageFilter";
import {
  paginationQuery,
  filterQuery,
  filterProofQuery,
  filterSearchQuery,
} from "../lib/adminHelpers";
import isEmpty from "../lib/isEmpty";
import { encodedata } from "../lib/cryptoJS";

/**
 * Multer Image Uploade
 */
const currencyStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.IMAGE.CURRENCY_PATH);
  },
  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(null, "currency-" + Date.now() + path.extname(file.originalname));
  },
});

let currencyUpload = multer({
  storage: currencyStorage,
  onError: function (err, next) {
    next(err); // Pass the error to next middleware
  },
  fileFilter: imageFilter, // Custom image filter
  limits: { fileSize: config.IMAGE.CURRENCY_SIZE }, // Limit file size
}).fields([{ name: "image", maxCount: 1 }]);

export const uploadCurrency = (req, res, next) => {
  currencyUpload(req, res, function (err) {
     
      if (!isEmpty(req.validationError)) {
          return res.status(400).json({
              success: false,
              errors: {
                  [req.validationError.fieldname]: req.validationError.messages,
              },
          });
      }

      if (err instanceof multer.MulterError) {
          return res
              .status(400)
              .json({ success: false, errors: { [err.field]: "TOO_LARGE" } });
      } else if (err) {
          return res
              .status(500)
              .json({ success: false, message: "SOMETHING_WRONG" });
      }

      return next();
  });
};

export const getCurrency = async (req, res) => {
  try {
    const data = await Currency.aggregate(
      [
        { $match: { status: "active" } },
        {
          $project: {
            name: 1,
            coin: 1,
            symbol: 1,
            type: 1,
            withdrawFee: 1,
            minimumWithdraw: 1,
            bankDetails: 1,
            decimal: 1,
            depositStatus: 1,
            withdrawStatus: 1,
            depositminlimit: 1,
            commisionfee: 1,
            coinpaymentsymbol: 1,
            image: {
              $cond: [
                { $eq: ["$image", ""] },
                "",
                {
                  $concat: [
                    config.SERVER_URL,
                    config.IMAGE.CURRENCY_URL_PATH,
                    "$image",
                  ],
                },
              ],
            },
            fundFee: 1,
            api: 1,
            key: 1
          },
        },
      ])
    if (data) {
      return res
        .status(200)
        .json(encodedata({ success: true, message: "FETCH_SUCCESS", result: data }));
    } else {
      return res
        .status(500)
        .json(encodedata({ success: false, message: "SOMETHING_WRONG" }));
    }
  } catch (e) {
    return res
      .status(500)
      .json(encodedata({ success: false, message: "SOMETHING_WRONG" }));
  }
  // Currency.aggregate(
  //   [
  //     { $match: { status: "active" } },
  //     {
  //       $project: {
  //         name: 1,
  //         coin: 1,
  //         symbol: 1,
  //         type: 1,
  //         withdrawFee: 1,
  //         minimumWithdraw: 1,
  //         bankDetails: 1,
  //         decimal: 1,
  //         depositStatus: 1,
  //         withdrawStatus: 1,
  //         depositminlimit: 1,
  //         commisionfee : 1,
  //         coinpaymentsymbol : 1,
  //         image: {
  //           $cond: [
  //             { $eq: ["$image", ""] },
  //             "",
  //             {
  //               $concat: [
  //                 config.SERVER_URL,
  //                 config.IMAGE.CURRENCY_URL_PATH,
  //                 "$image",
  //               ],
  //             },
  //           ],
  //         },
  //         fundFee: 1,
  //         api : 1,
  //         key : 1
  //       },
  //     },
  //   ],
  //   (err, data) => {
  //     if (err) {
  //       return res
  //         .status(500)
  //         .json({ success: false, message: "SOMETHING_WRONG" });
  //     }
  //     return res
  //       .status(200)
  //       .json({ success: true, message: "FETCH_SUCCESS", result: data });
  //   }
  // );
};

/**
 * Get All Currency List
 * URL : /adminapi/currency
 * METHOD : GET
 */
export const currencyList = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query);
    let filter = filterSearchQuery(req.query, [
      "name",
      "coin",
      "type",
      "status",
    ]);
    let Export = req.query.export;
    const header = ["Name", "Type", "Coin", "status"];
    let count = await Currency.countDocuments(filter);
    if (Export == "csv" || Export == "xls") {
      let exportData = await Currency.find(filter, {
        _id: 1,
        name: 1,
        coin: 1,
        symbol: 1,
        image: 1,
        type: 1,
        withdrawFee: 1,
        minimumWithdraw: 1,
        decimal: 1,
        bankDetails: 1,
        tokenType: 1,
        minABI: 1,
        contractAddress: 1,
        contractDecimal: 1,
        isPrimary: 1,
        depositType: 1,
        fundLimit: 1,
        fundFee: 1,
        fundInterval: 1,
        status: 1,
        depositStatus: 1,
        withdrawStatus: 1,
        depositminlimit: 1,
        commisionfee: 1,
        coinpaymentsymbol: 1,
        api: 1,
        key: 1
      }).sort({ createdAt: -1 });

      let csvData = [header];

      if (exportData && exportData.length > 0) {
        for (let item of exportData) {
          let arr = [];
          arr.push(item.name, item.type, item.coin, item.status);
          csvData.push(arr);
        }
      }
      return res.csv(csvData);
    } else if (Export == "pdf") {
      let data = await Currency.find(filter, {
        _id: 1,
        name: 1,
        coin: 1,
        symbol: 1,
        image: 1,
        type: 1,
        withdrawFee: 1,
        minimumWithdraw: 1,
        decimal: 1,
        bankDetails: 1,
        tokenType: 1,
        minABI: 1,
        contractAddress: 1,
        contractDecimal: 1,
        isPrimary: 1,
        depositType: 1,
        fundLimit: 1,
        fundFee: 1,
        fundInterval: 1,
        status: 1,
        depositStatus: 1,
        withdrawStatus: 1,
        depositminlimit: 1,
        commisionfee: 1,
        coinpaymentsymbol: 1,
        api: 1,
        key: 1
      }).sort({ createdAt: -1 });
      // .skip(pagination.skip).limit(pagination.limit);

      let result = {
        count,
        pdfData: data,
        imageUrl: `${config.SERVER_URL}${config.IMAGE.CURRENCY_URL_PATH}`,
      };

      return res
        .status(200)
        .json({ success: true, message: "FETCH_SUCCESS", result });
    } else {
      let data = await Currency.find(filter, {
        _id: 1,
        name: 1,
        coin: 1,
        symbol: 1,
        image: 1,
        type: 1,
        withdrawFee: 1,
        minimumWithdraw: 1,
        decimal: 1,
        bankDetails: 1,
        tokenType: 1,
        minABI: 1,
        contractAddress: 1,
        contractDecimal: 1,
        isPrimary: 1,
        depositType: 1,
        fundLimit: 1,
        fundFee: 1,
        fundInterval: 1,
        status: 1,
        depositStatus: 1,
        withdrawStatus: 1,
        depositminlimit: 1,
        commisionfee: 1,
        coinpaymentsymbol: 1,
        api: 1,
        key: 1
      })
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit);
      let result = {
        count,
        data,
        imageUrl: `${config.SERVER_URL}${config.IMAGE.CURRENCY_URL_PATH}`,
      };

      return res
        .status(200)
        .json(encodedata({ success: true, message: "FETCH_SUCCESS", result }));
    }
  } catch (err) {
    return res.status(500).json({ success: true, message: "SOMETHING_WRONG" });
  }
};

/**
 * Add Currency
 * URL : /adminapi/currency
 * METHOD : POST
 * BODY : name, symbol, coin, image, contractAddress, minABI, contractDecimal, decimal, tokenType, bankName, accountNo, holderName, bankcode, country, withdrawFee, minimumWithdraw, depositType, fundLimit, fundFee, fundInterval
 */
export const addCurrency = async (req, res) => {
  try {
    let reqBody = req.body,
      reqFile = req.files;
    let checkCurrency = await Currency.findOne({ coin: reqBody.symbol });
    if (checkCurrency) {
      return res
        .status(400)
        .json({ success: false, errors: { coin: "Coin already exists" } });
    }

    const newDoc = new Currency({
      name: reqBody.name,
      coin: reqBody.symbol,
      symbol: reqBody.symbol,
      image: reqFile.image[0].filename,
      withdrawFee: reqBody.withdrawFee,
      minimumWithdraw: reqBody.minimumWithdraw,
      type: reqBody.type,
      depositType: reqBody.depositType,
      payment: reqBody.payment,
      UPI: reqBody.upiInputValue,
      depositStatus: reqBody.depositStatus,
      withdrawStatus: reqBody.withdrawStatus,
      commisionfee: reqBody?.commisionfee,
      decimal: reqBody.decimals,
      coinpaymentsymbol: reqBody?.coinpaymentsymbol
    });
    if (reqBody.depositType == "local") {
      newDoc["api"] = reqBody?.api,
        newDoc["key"] = reqBody?.key
    }
    if (reqBody.type == "token") {
      newDoc["contractAddress"] = reqBody.contractAddress;
      newDoc["minABI"] = reqBody.minABI;
      newDoc["decimal"] = reqBody.decimals;
      newDoc["tokenType"] = reqBody.tokenType;
    } else if (reqBody.type == "fiat") {
      newDoc["bankDetails"] = {
        payment: req.body.payment,
        bankName: reqBody.bankName,
        accountNo: reqBody.accountNo,
        holderName: reqBody.holderName,
        bankcode: reqBody.bankcode,
        country: reqBody.country,
      };
    }

    let newData = await newDoc.save();
    addPriceCNV(newData);
    newAssetAllUsr(newData);
    return res
      .status(200)
      .json({ success: true, message: "Coin added successfully" });
  } catch (err) {
    console.log('errrrrrrrrrrrrr-------------', err)
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

/**
 * Update Currency
 * URL : /adminapi/currency
 * METHOD : PUT
 * BODY : currencyId, name, coin, symbol, image, contractAddress, minABI, decimal, contractDecimal, tokenType, bankName, accountNo, holderName, bankcode, country, withdrawFee, minimumWithdraw, depositType, fundLimit, fundFee, fundInterval
 */
export const updateCurrency = async (req, res) => {
  try {
    let reqBody = req.body,
      reqFile = req.files;
      // console.log('reqBody-----reqFile',reqBody, reqFile)
    let checkCurrency = await Currency.findOne({
      coin: reqBody.coin,
      _id: { $ne: reqBody.currencyId },
    });
    if (checkCurrency) {
      return res
        .status(400)
        .json({ success: false, errors: { coin: "Coin already exists" } });
    }

    let currencyDoc = await Currency.findOne({ _id: reqBody.currencyId });

    currencyDoc.name = reqBody.name;
    currencyDoc.coin = reqBody.coin;
    currencyDoc.symbol = reqBody.symbol;
    currencyDoc.image =
      reqFile.image && reqFile.image[0]
        ? reqFile.image[0].filename
        : currencyDoc.image;
    currencyDoc.withdrawFee = reqBody.withdrawFee;
    currencyDoc.minimumWithdraw = reqBody.minimumWithdraw;
    currencyDoc.type = reqBody.type;
    currencyDoc.depositType = reqBody.depositType;
    currencyDoc.depositminlimit = reqBody.depositminlimit;
    currencyDoc.status = reqBody.status;
    currencyDoc.decimal = reqBody.decimal;
    currencyDoc.fundLimit = reqBody.fundLimit;
    currencyDoc.fundFee = reqBody.fundFee;
    currencyDoc.fundInterval = reqBody.fundInterval;
    currencyDoc.depositStatus = reqBody.depositStatus;
    currencyDoc.withdrawStatus = reqBody.withdrawStatus;
    currencyDoc.commisionfee = reqBody?.commisionfee;
    currencyDoc.coinpaymentsymbol = reqBody?.coinpaymentsymbol
    if (reqBody.depositType == "local") {
      currencyDoc.api = reqBody?.api,
        currencyDoc.key = reqBody?.key
    }
    if (reqBody.type == "token") {
      currencyDoc.contractAddress = reqBody.contractAddress;
      currencyDoc.minABI = reqBody.minABI;
      currencyDoc.contractDecimal = reqBody.contractDecimal;
      currencyDoc.tokenType = reqBody.tokenType;
    } else if (reqBody.type == "fiat") {
      currencyDoc.bankDetails.bankName = reqBody.bankName;
      currencyDoc.bankDetails.accountNo = reqBody.accountNo;
      currencyDoc.bankDetails.holderName = reqBody.holderName;
      currencyDoc.bankDetails.bankcode = reqBody.bankcode;
      currencyDoc.bankDetails.country = reqBody.country;
    }

    await currencyDoc.save();
    return res
      .status(200)
      .json({ success: true, message: "Coin updated successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

/**
 * Get Language Dropdown
 * URL : /adminapi/getLanguage
 * METHOD : GET
 */
export const getLanguage = async (req, res) => {
  Language.find(
    { status: "active" },
    { _id: 1, code: 1, name: 1, isPrimary: 1, status: 1 },
    (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Something went wrong" });
      }
      return res
        .status(200)
        .json({ success: true, message: "Fetch successfully", result: data });
    }
  );
};
