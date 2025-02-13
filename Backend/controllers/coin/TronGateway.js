import TronWeb from "tronweb";
import axios from "axios";

import { mailTemplateLang } from "../emailTemplate.controller";

import { sentSms } from "../../lib/smsGateway";
import config from "../../config";
import { encryptString, decryptString } from "../../lib/cryptoJS";
import isEmpty from "../../lib/isEmpty";

//Modals
import {
  Assets,
  Transaction,
  Currency,
  Wallet,
  User,
  UserReference,
} from "../../models";

// tron config
const HttpProvider = TronWeb.providers.HttpProvider,
  fullNode = new HttpProvider(config.coinGateway.tron.fullNode),
  solidityNode = new HttpProvider(config.coinGateway.tron.solidityNode),
  eventServer = new HttpProvider(config.coinGateway.tron.eventServer);

// const privateKey = "3269CC93504FA54485A66C0BC9F8A160B95AD40212E7A35A5483BC3AF7FB40AD";
// const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);

/**
 * Create Tron User
 */
export const createAddress = async () => {
  let responseData = {
    privateKey: "",
    address: "",
  };
  try {
    let tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
    let createAccount = await tronWeb.createAccount();
    responseData["privateKey"] = createAccount.privateKey;
    responseData["address"] = createAccount.address.base58;
    return {
      status: true,
      address: createAccount.address.base58,
      privateKey: createAccount.privateKey,
    };
  } catch (err) {
    return false;
  }
};

export const tronDeposit = async (userId) => {
  try {
    const walletData = await Wallet.findOne({ _id: userId }).populate("_id");
    if (!walletData) {
      return res.status(500).json({ messages: "user assets not found" });
    }

    let userAssetData = walletData.assets.find(
      (currency) => currency.coin == "TRX"
    );
    let checkBalance = await getAccountBalance(userAssetData.address);
    checkBalance = checkBalance / config.coinGateway.tron.tronDecimal;
    if (checkBalance > 0) {
      let transactionURL = config.coinGateway.tron.transactionUrl;
      transactionURL = transactionURL.replace(
        /##USER_ADDRESS##/gi,
        userAssetData.address
      );

      let respData = await axios({
        method: "get",
        url: transactionURL,
      });

      if (
        respData.data.success == true &&
        respData.data.data &&
        respData.data.data.length > 0
      ) {
        createTransaction({
          userId: userId,
          tronData: respData.data.data,
          userAssetData: userAssetData,
        });
      }
    }
  } catch (err) {
  }
};

export const tronTokenDeposit = async (userId, currencySymbol) => {
  try {

    let currencyData = await Currency.findOne({
      coin: currencySymbol,
      tokenType: "trc20",
    });
    if (!currencyData) {
      return { messages: "currency not found" };
    }
    let userWalletData = await Wallet.findOne({ userId: userId }).populate(
      "_id"
    );
    let userAssetData = userWalletData.assets.find(
      (el) => el.coin == currencySymbol
    );
    let checkBalance = await getContractBalance({
      privateKey: decryptString(userAssetData.privateKey),
      address: userAssetData.address,
      currencycontract: currencyData.contractAddress,
      decimals: currencyData.contractDecimal,
    });
    if (checkBalance > 0) {
      let transactionURL = config.coinGateway.tron.transactionContractUrl;
      transactionURL = transactionURL.replace(
        /##USER_ADDRESS##/gi,
        userAssetData.address
      );
      transactionURL = transactionURL.replace(
        /##CONTRACT_ADDRESS##/gi,
        currencyData.contractAddress
      );

      let respData = await axios({
        method: "get",
        url: transactionURL,
      });

      if (
        respData.data.success == true &&
        respData.data.data &&
        respData.data.data.length > 0
      ) {
        createTokenTrx({
          userId: userId,
          tronData: respData.data.data,
          adminCurrencyAddress: config.coinGateway.tron.address,
          userCurrencyAddress: userAssetData.address,
          currency: currencyData.coin,
          currencyId: currencyData._id,
          depositminlimit: currencyData.depositminlimit,
          decimals: currencyData.contractDecimal,
        });
      }

      if (userAssetData.address != config.coinGateway.tron.address) {
        adminSentUser({
          //'adminUserId': adminUserData._id,
          userId: userId,
          privateKey: decryptString(userAssetData.privateKey),
          adminPrivateKey: decryptString(config.coinGateway.tron.privateKey),
          amount: checkBalance,
          adminCurrencyAddress: config.coinGateway.tron.address,
          userCurrencyAddress: userAssetData.address,
          currency: currencyData.coin,
          currencyId: currencyData._id,
          contractAddress: currencyData.contractAddress,
          decimals: currencyData.contractDecimal,
        });
      }
    }

    // return res.status(200).json({ "messages": "success" })
  } catch (err) {
    // return res.status(500).json({ "messages": "Error" })
    return { messages: "Error" };
  }
};

const getContractBalance = async ({
  currencycontract,
  privateKey,
  address,
  decimals,
}) => {
  const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
  try {
   
    let accountDetail = await tronWeb.contract().at(currencycontract);
    let result = await accountDetail.balanceOf(address).call();
    return JSON.parse(result) / 10 ** parseInt(decimals);
  } catch (err) {
    return 0;
  }
};

const getAccountBalance = async (address) => {
  try {
    let tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
    let accountDetail = await tronWeb.trx.getBalance(address);
    return accountDetail;
  } catch (err) {
    return 0;
  }
};

const convertToBaseAddress = async (address) => {
  let tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
  try {
    let baseAddress = await tronWeb.address.fromHex(address);
    return baseAddress;
  } catch (err) {
    return "";
  }
};

const createTokenTrx = async ({
  userId,
  tronData,
  adminCurrencyAddress,
  userCurrencyAddress,
  currency,
  currencyId,
  depositminlimit,
  decimals,
}) => {
  try {
    for (let item of tronData) {
      if (item && item.to.toString() == userCurrencyAddress) {
        let txid = item.transaction_id,
          amount = item.value / 10 ** decimals;
        let transactionData = await Transaction.findOne({
          userId: userId,
          txid,
        });

        if (
          !transactionData &&
          parseFloat(amount) >= parseFloat(depositminlimit)
        ) {
          //referralcommission
          let UserB = await Transaction.find({
            $and: [
              { userId: userId },
              { paymentType: { $in: ["coin_deposit", "fiat_deposit"] } },
            ],
          });
          if (isEmpty(UserB)) {
            let userData = await User.findOne({ userId: userId }, { _id: 1 });
            let referTable = await UserReference.find({
              "referChild._id": userData._id,
            });
            if (!isEmpty(referTable)) {
              let data = await User.findOne(
                { _id: referTable[0]._id },
                { userId: 1 }
              );

              let UserA = await Transaction.find({
                $and: [
                  { userId: data.userId },
                  {
                    paymentType: { $in: ["coin_deposit", "fiat_deposit"] },
                  },
                ],
              });

              if (!isEmpty(UserA)) {
                let currencyId = await Currency.find({ "name": "cluxcoin" })
                let usrWallet = await Wallet.findOne({
                  _id: data._id,
                })

                let usrAsset = usrWallet.assets.id(currencyId[0]._id);

                let beforeBalance = parseFloat(usrAsset.spotBal);
                let referralamount = 5;
                usrAsset.spotBal = parseFloat(usrAsset.spotBal) + (referralamount);
                let updateWallet = await usrWallet.save();


                // let assestdata = await Wallet.updateOne(
                //   {
                //     _id: data._id,
                //     "assets.coin": "CLUX",
                //   },
                //   {
                //     $inc: {
                //       "assets.$.spotBal": +referralamount,
                //     },
                //   }
                // );

                if (assestdata) {
                  let referData = await UserReference.updateOne(
                    { _id: data._id, "referChild._id": userData._id },
                    { $inc: { "referChild.$.amount": +referralamount } }
                  );

                  // Referral CREATE PASS_BOOK
                  createPassBook({
                    'userId': data._id,
                    'coin': "CLUX",
                    'currencyId': currencyId[0]._id,
                    'tableId': usrWallet._id,
                    'beforeBalance': beforeBalance,
                    'afterBalance': parseFloat(usrAsset.spotBal),
                    'amount': parseFloat(referralamount),
                    'type': 'referral_amount',
                    'category': 'credit'
                  })

                }
              }
            }
          }

          let transactions = new Transaction();
          transactions["userId"] = userId;
          transactions["coin"] = currency;
          transactions["toAddress"] = item.to;
          transactions["fromAddress"] = item.from;
          transactions["amount"] = amount;
          transactions["txid"] = txid;
          transactions["currencyId"] = currencyId;
          transactions["paymentType"] = "coin_deposit";
          transactions["status"] = "completed";

          await transactions.save();

          if (adminCurrencyAddress != userCurrencyAddress) {

            let userData = await Wallet.findOne({
              userId: userId
            })
            let AssetData = userData.assets.id(walletData._id);

            let beforeBalance = parseFloat(AssetData.spotBal);
            AssetData.spotBal = parseFloat(AssetData.spotBal) + parseFloat(amount);
            let WalletData = await userData.save();

            // CREATE PASS_BOOK
            createPassBook({
              'userId': userData._id,
              'coin': "BNB",
              'currencyId': walletCurrency._id,
              'tableId': transaction._id,
              'beforeBalance': beforeBalance,
              'afterBalance': parseFloat(AssetData.spotBal),
              'amount': parseFloat(amount),
              'type': 'coin_deposit',
              'category': 'credit'
            })

            // await Wallet.updateOne(
            //   {
            //     userId: userId,
            //     "assets._id": currencyId,
            //   },
            //   {
            //     $inc: {
            //       "assets.$.spotBal": amount,
            //     },
            //   }
            // );
          }
        }
      }
    }
  } catch (err) {
    return false;
  }
};

const adminSentUser = async ({
  privateKey,
  adminPrivateKey,
  adminCurrencyAddress,
  userCurrencyAddress,
  amount,
  currency,
  currencyId,
  userId,
  contractAddress,
  decimals,
}) => {
  try {
    let userTronBalance = await getAccountBalance(userCurrencyAddress);
    if (
      userTronBalance > 0 &&
      userTronBalance >
      config.coinGateway.tron.adminAmtSentToUser *
      config.coinGateway.tron.tronDecimal
    ) {
      userTokenMoveToAdmin({
        contractAddress,
        privateKey,
        adminCurrencyAddress,
        userCurrencyAddress,
        amount,
        decimals,
      });
    } else {
      // checkTransaction
      let adminSentUserTrxId = await sentTransaction({
        fromAddress: adminCurrencyAddress,
        toAddress: userCurrencyAddress,
        privateKey: adminPrivateKey,
        amount: config.coinGateway.tron.adminAmtSentToUser,
        // 'decimal':decimals,
      });
    }
  } catch (err) {
    return false;
  }
};

const userTokenMoveToAdmin = async ({
  contractAddress,
  privateKey,
  adminCurrencyAddress,
  userCurrencyAddress,
  amount,
  decimals,
}) => {
  try {
    let userTrokenSentAdminTrxId = await sendToaddressContract({
      currencycontract: contractAddress,
      toAddress: adminCurrencyAddress,
      privateKey: privateKey,
      fromAddress: userCurrencyAddress,
      amount: amount,
      decimals: decimals,
    });


    if (!userTrokenSentAdminTrxId) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};

const sendToaddressContract = async ({
  currencycontract,
  fromAddress,
  toAddress,
  privateKey,
  amount,
  decimals,
}) => {
  let tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
  try {
    let balance = await getContractBalance({
      currencycontract,
      address: fromAddress,
      privateKey,
      decimals,
    });


    if (balance >= amount) {
      var value = await tronWeb.toBigNumber(amount * 10 ** decimals);
      let contract = await tronWeb.contract().at(currencycontract);
    
      let transaction = await contract
        .transfer(
          toAddress, //address _to
          value.toString(10) //amount
        )
        .send({
          feeLimit: 1000000000,
        });

      return transaction;
    }
    return false;
  } catch (err) {
    return false;
  }
};

const createTransaction = async ({ userId, tronData, userAssetData }) => {
  try {
    for (let item of tronData) {
      let txid = item.txID,
        amount =
          item.raw_data.contract[0].parameter.value.amount /
          config.coinGateway.tron.tronDecimal;

      if (item.raw_data.contract[0].type == "TransferContract") {
        let transactionData = await Transaction.findOne({
          userId: userId,
          txid,
        });
        if (!transactionData) {
          let { status, txHash } = await sentTransaction({
            fromAddress: userAssetData.address,
            toAddress: config.coinGateway.tron.address,
            privateKey: decryptString(userAssetData.privateKey),
            amount,
          });
          let TO_ADDRESS = await convertToBaseAddress(
            item.raw_data.contract[0].parameter.value.to_address
          );
          let FROM_ADDRESS = await convertToBaseAddress(
            item.raw_data.contract[0].parameter.value.owner_address
          );
          if (status) {
            let transactions = new Transaction();

            transactions["userId"] = userId;
            transactions["coin"] = "TRX";
            transactions["toAddress"] = TO_ADDRESS;
            transactions["fromAddress"] = FROM_ADDRESS;
            transactions["amount"] = amount;
            transactions["txid"] = txid;
            transactions["currencyId"] = userAssetData.currency;
            transactions["paymentType"] = "coin_deposit";
            transactions["status"] = "completed";

            await transactions.save();

            await Wallet.updateOne(
              {
                userId: userId,
                "assets._id": userAssetData._id,
              },
              {
                $inc: {
                  "assets.$.spotBal": amount,
                },
              }
            );
            if (
              userAssetData &&
              userAssetData._id &&
              userAssetData._id.role == 1
            ) {
              let content = {
                email: userAssetData._id.email,
                currency: "TRX",
                amount: amount,
                tranactionId: txid,
                date: new Date(),
              };

              mailTemplateLang({
                userId: userId,
                identifier: "User_deposit",
                toEmail: userAssetData._id.email,
                content,
              });
            }

            if (
              userAssetData &&
              userAssetData._id &&
              userAssetData._id.role == 2
            ) {
              let smsContent = {
                to: `+${userAssetData._id.phoneCode}${userAssetData._id.phoneNo}`,
                body:
                  "Dear User Your Deposit Successfully - " +
                  "currencySymbol - TRX" +
                  "amount - " +
                  amount +
                  "txid - " +
                  txid,
              };

              sentSms(smsContent);
            }
          }
        }
      }
    }
  } catch (err) {
    return false;
  }
};

const convertToHex = async (address) => {
  let tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
  try {
    let hexAddress = await tronWeb.address.toHex(address);
    return hexAddress;
  } catch (err) {
    return "";
  }
};

// only for the TRX
export const sentTransaction = async ({
  fromAddress,
  toAddress,
  privateKey,
  amount,
}) => {
  const tronWeb = new TronWeb({
    fullHost: config.coinGateway.tron.fullNode,
    privateKey,
  });

  let fromAddressBalance = await getAccountBalance(fromAddress);
  let transferAmount = amount * config.coinGateway.tron.tronDecimal;

  if (fromAddressBalance < transferAmount) {
    return {
      status: false,
      message: "Insufficient TRX Balance",
    };
  }

  let fromAddressHex = await convertToHex(fromAddress);
  let toAddressHex = await convertToHex(toAddress);
  try {
    let accountDetail = await tronWeb.transactionBuilder.sendTrx(
      toAddressHex,
      transferAmount,
      fromAddressHex
    );
    let signedTx = await tronWeb.trx.sign(accountDetail);
    let broastTx = await tronWeb.trx.sendRawTransaction(signedTx);
    return {
      status: true,
      txHash: broastTx.txid,
    };
  } catch (err) {
    return false;
  }
};

// TRC20 Token Withdraw

export const tokenMoveToUser = async ({
  currencycontract,
  fromAddress,
  toAddress,
  privateKey,
  amount,
  decimals,
}) => {
  let tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
  try {
    let balance = await getContractBalance({
      currencycontract,
      address: fromAddress,
      privateKey,
      decimals,
    });

    if (balance >= amount) {
      var value = await tronWeb.toBigNumber(amount * 10 ** decimals);
      let contract = await tronWeb.contract().at(currencycontract);
      let transaction = await contract
        .transfer(
          toAddress, //address _to
          value.toString(10) //amount
        )
        .send({
          feeLimit: 1000000000,
        });

    
      return {
        status: true,
        message: "Transaction successfully",
        trxId: transaction,
      };
    }
    return {
      status: false,
      message: "Transaction Failed",
    };
  } catch (err) {
    return {
      status: false,
      message: "Error on Occured",
    };
  }
};

// async function sentToken() {
//      let data = await sendToaddressContract({
//         currencycontract : 'TCMRiv3oegmXX9TGeycv1UJ8YxFfZZV9Td',
//         fromAddress : config.coinGateway.tron.address,
//         toAddress : "TX4WjfSdWfvm6WUd8CRGzXr2R3P956QiYa",
//         privateKey : decryptString(config.coinGateway.tron.privateKey),
//         amount : 1,
//         decimals : 18,
//      })

// }

// sentToken()

// async function checkTokenBal() {
//     let checkBalance = await getContractBalance({
//         "privateKey": decryptString('U2FsdGVkX19lrJUMUsm5X4DE0iZfGEwEUs46bZrB6B1lmIN6EDKW/Zb9leIQGWmIj8zLzQU/uoq+GlySNb+j8EqbOMuPkzYMOf277BxM8W2Lenf459WSxgDhGcLzWwVz'),
//         "address": 'TQkHKHXBpAmkgCzyxfdqcUrFsTbE2Jq1Ag',
//         "currencycontract": 'TCMRiv3oegmXX9TGeycv1UJ8YxFfZZV9Td',
//         "decimals": '18',
//     });

// }

// checkTokenBal()
