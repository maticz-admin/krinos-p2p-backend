// import package
import axios from 'axios';
import https from 'https';
import converter from 'hex2dec';
import querystring from 'querystring'
import mongoose from "mongoose";

// import modal
import { Transaction, Currency, User, Wallet } from '../../models';

// import controller
import { mailTemplateLang } from '../emailTemplate.controller';

// import config
import config from '../../config';

// import lib
import isEmpty from '../../lib/isEmpty';
import isJsonParse from '../../lib/isJsonParse';
import { encryptString, decryptString } from '../../lib/cryptoJS';

const ObjectId = mongoose.Types.ObjectId;

export const createAddress = async () => {
    try {
        let respData = await axios({
            'method': 'get',
            'timeout': 1000,
            'url': `${config.COIN_GATE_WAY.ETH.URL}/getnewaddress`,
        });

        if (respData && respData.status == 200 && !isEmpty(respData.data.data)) {
            const { address, privateKey } = respData.data.data;
            return {
                address,
                privateKey
            }
        } else {
            return {
                address: '',
                privateKey: ''
            }
        }
    }
    catch (err) {
        return {
            address: '',
            privateKey: ''
        }
    }
}

/** 
 * Deposit ETH
*/
export const deposit = async (userId) => {
    try {

        let userWalletData = await Wallet.findOne({ '_id': userId }).populate('_id');
        let walletData = userWalletData.assets.find((el) => el.coin == 'ETH');
        let { latestBlockNumber } = await getLatestBlock()

        var startBlock = config.coinGateway.eth.startBlock;
        let currentBlock = walletData.blockNo > 0 ? walletData.blockNo : startBlock;

        let depositUrl = config.coinGateway.eth.ethDepositUrl
            .replace('##USER_ADDRESS##', walletData.address)
            .replace('##START_BLOCK##', currentBlock)
            .replace('##END_BLOCK##', latestBlockNumber);

        let respData = await axios({
            'url': depositUrl,
            'method': 'post'
        })

        if (respData && respData.data && respData.data.status == "1") {
            for (let y in respData.data.result) {
                let result = respData.data.result[y];
                let userAssetData = await Wallet.findOne(
                    {
                        'assets.address': { '$regex': new RegExp('.*' + result.to.toLowerCase() + '.*', 'i') },
                        'assets.coin': "ETH"
                    })
                if (userAssetData) {
                    let transactionExist = await Transaction.findOne({
                        txid: result.hash,
                    });



                    if (!transactionExist) {

                        let responseData = await amountMoveToAdmin({
                            toAddress: config.coinGateway.eth.address,
                            privateKey: decryptString(walletData.privateKey),
                            fromAddress: walletData.address,
                            // amount: result.value/1000000000000000000,
                        })

                        if (responseData && responseData.status) {
                            let amount = parseFloat(result.value) / 10 ** 18
                            let transaction = new Transaction({
                                userId: userId,
                                currencyId: walletData._id,
                                fromAddress: result.from,
                                toAddress: result.to,
                                txid: result.hash,
                                coin: walletData.coin,
                                paymentType: "coin_deposit",
                                amount: amount,
                                status: "completed"
                            });
                            let newTransaction = await transaction.save();

                            // userAssetData.spotwallet = userAssetData.spotwallet + result.value/1000000000000000000;
                            // userAssetData.blockNo = latestBlockNumber;
                            // await userAssetData.save();

                            await Wallet.updateOne({
                                '_id': userId,
                                'assets._id': walletData._id
                            }, {
                                '$inc': {
                                    'assets.$.spotBal': amount,
                                    'amount.$.blockNo': latestBlockNumber
                                }
                            })

                            let content = {
                                'email': userWalletData._id.email,
                                'currency': 'ETH',
                                'amount': amount,
                                'tranactionId': result.hash,
                                'date': new Date(),
                            };

                            mailTemplateLang({
                                'userId': userId,
                                'identifier': 'User_deposit',
                                'toEmail': userWalletData._id.email,
                                content
                            })
                        }
                    }
                }
            }
        }
    }
    catch (err) {
        return
    }
}


/** 
 * Deposit ERC20_TOEKEN
*/
export const ERC20_Deposit = async (userId, currencySymbol) => {
    try {

        let getUsers = await User.aggregate([
            { "$match": { "_id": ObjectId(userId) } },
            {
                "$lookup": {
                    "from": "Assets",
                    "localField": "_id",
                    "foreignField": "userId",
                    "as": "userAssetsInfo"
                }
            },
            {
                "$unwind": "$userAssetsInfo"
            },
            { "$match": { "userAssetsInfo.currencySymbol": currencySymbol } },
            {
                "$lookup": {
                    "from": "currency",
                    "localField": "userAssetsInfo.currency",
                    "foreignField": "_id",
                    "as": "currencyInfo"
                }
            },
            {
                "$unwind": "$currencyInfo"
            },
            {
                "$project": {
                    "_id": 1,
                    "blockNo": "$userAssetsInfo.blockNo",
                    "userAssetId": "$userAssetsInfo.userId",
                    "currencySymbol": "$userAssetsInfo.currencySymbol",
                    "currencyAddress": "$userAssetsInfo.currencyAddress",
                    "privateKey": "$userAssetsInfo.privateKey",
                    "currencyId": "$userAssetsInfo.currency",
                    "contractAddress": "$currencyInfo.contractAddress",
                    "minABI": "$currencyInfo.minABI",
                    "decimals": "$currencyInfo.decimals",
                }
            }
        ])

        let { latestBlockNumber } = await getLatestBlock()
        for (let x in getUsers) {
            var user = getUsers[x];

            var startBlock = config.coinGateway.eth.startBlock;
            let currentBlock = user.blockNo > 0 ? user.blockNo : startBlock;

            let depositUrl = config.coinGateway.eth.ethTokenDepositUrl
                .replace('##USER_ADDRESS##', user.currencyAddress)
                .replace('##START_BLOCK##', currentBlock)
                .replace('##END_BLOCK##', latestBlockNumber);
            let respData = await axios({
                'url': depositUrl,
                'method': 'post'
            })

            if (respData && respData.data && respData.data.status == "1") {
                for (let y in respData.data.result) {
                    let result = respData.data.result[y];

                    let userAssetData = await Assets.findOne(
                        {
                            'currencyAddress': { '$regex': new RegExp('.*' + result.to.toLowerCase() + '.*', 'i') },
                            'currencySymbol': currencySymbol
                        })

                    if (userAssetData) {
                        let transactionExist = await Transaction.findOne({
                            txid: result.hash,
                        });

                        if (!transactionExist) {

                            let responseData = await tokenMoveToAdmin({
                                userPrivateKey: decryptString(userAssetData.privateKey),
                                adminPrivateKey: decryptString(config.coinGateway.eth.privateKey),
                                fromAddress: userAssetData.currencyAddress,
                                toAddress: config.coinGateway.eth.address,
                                minAbi: user.minABI,
                                contractAddress: user.contractAddress,
                                decimals: user.decimals,
                                amount: result.value / 10 ** parseInt(user.decimals)
                            })


                            if (responseData && responseData.status) {

                                let transaction = new Transaction({
                                    userId: userAssetData.userId,
                                    currencyId: user.currencyId,
                                    fromaddress: result.from,
                                    toaddress: result.to,
                                    txid: result.hash,
                                    currencySymbol: userAssetData.currencySymbol,
                                    paymentType: "coin_deposit",
                                    amount: result.value / 10 ** parseInt(user.decimals),
                                    status: "completed"
                                });
                                let newTransaction = await transaction.save();
                                userAssetData.spotwallet = userAssetData.spotwallet + result.value / 1000000000000000000;
                                userAssetData.blockNo = latestBlockNumber;
                                await userAssetData.save();

                                let content = {
                                    'email': user.email,
                                    'currencySymbol': currencySymbol,
                                    'amount': result.value / 1000000000000000000,
                                    'txid': result.hash,
                                    'date': new Date(),
                                };

                                mailTemplateLang({
                                    'userId': userAssetData.userId,
                                    'identifier': 'User_deposit',
                                    'toEmail': user.email,
                                    content
                                })
                            }
                        }
                    }
                }
            }
        }
    }
    catch (err) {
        return
    }
}


export const amountMoveToAdmin = async (data) => {
    try {
        let respData = await axios({
            'method': 'post',
            'url': `${config.COIN_GATE_WAY.ETH.URL}/eth-move-to-admin`,
            data
        });

        if (respData && respData.data) {
            return respData.data
        }
    } catch (err) {

        return {
            status: false,
            message: 'Error on Server'
        }
    }
}

export const tokenMoveToAdmin = async (data) => {
    try {
        let respData = await axios({
            'method': 'post',
            'url': `${config.COIN_GATE_WAY.ETH.URL}/erc20-token-move-to-admin`,
            data
        });

        if (respData && respData.data) {
            return respData.data
        }
    } catch (err) {

        return {
            status: false,
            message: 'Error on Server'
        }
    }
}

export const getLatestBlock = async () => {
    try {
        let respData = await axios({
            'method': 'get',
            'url': `${config.COIN_GATE_WAY.ETH.URL}/getLatestBlock`,
        })

        if (respData && respData.data && respData.data.status)
            return {
                latestBlockNumber: respData.data.data
            }

    } catch (err) {
        return {
            latestBlockNumber: 0
        }
    }
}


export const getTransactionList = (inc, count, currencyData, transactions = []) => {
    if (inc <= count) {
        let blknum = converter.decToHex(inc.toString());
        let params = config.coinGateway.eth.blockTransaction;
        params['tag'] = blknum;
        params = querystring.stringify(params);
        https.get(config.coinGateway.eth.etherscanUrl + params, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                try {
                    var responseTxn = JSON.parse(data);
                    if (responseTxn.result.transactions.length > 0) {
                        transactions = [...transactions, ...responseTxn.result.transactions]
                        var inc2 = inc + 1;
                        getTransactionList(inc2, count, currencyData, transactions)
                    }
                    else {
                        var inc2 = inc + 1;
                        getTransactionList(inc2, count, currencyData, transactions)
                    }
                }
                catch (err) {
                    var inc2 = inc + 1;
                    getTransactionList(inc2, count, currencyData, transactions)
                }
            });
        }).on("error", (err) => {
            let inc2 = inc + 1;
            getTransactionList(inc2, count, currencyData)
        });
    }
    else {
        return checkCurrency(transactions, count, currencyData);
    }
}

export const checkCurrency = async (response, blockCnt, currencyData) => {
    try {
        let tokenData = await Currency.find({ 'type': 'Token', 'tokenType': 1 })
        if (response) {
            let count = 0
            for (let item of response) {
                count = count + 1
                // Check ERC 20 TOKEN ADDRESS
                if (item.contractAddress) {
                    let checkContractAddress = tokenData && tokenData.length > 0 && tokenData.find((el => { return el.contractAddress.toUpperCase() == item.contractAddress.toUpperCase() }))

                    if (checkContractAddress) {
                        let currencyData = checkContractAddress;
                        await updateTokenDeposit(item, currencyData)
                        // await ethTokenUpdate(item, currencyData)
                    }
                } else {
                    await updateDeposit(item, currencyData)
                }

                if (response.length == count) {
                    await Currency.update({ '_id': currencyData._id }, { "$set": { 'block': blockCnt } })
                }
            }
        } else {
            return
        }
    }
    catch (err) {
        return
    }
}

async function updateTokenDeposit(transactionsData, currencyData) {
    try {
        if (isEmpty(transactionsData.to)) {
            return
        }

        let userAssetData = await Assets.findOne(
            {
                'currencyAddress': {
                    '$regex': new RegExp('.*' + transactionsData.to.toLowerCase() + '.*', 'i')
                }
            }
        ).populate({ path: "userId", select: "email _id" })

        if (userAssetData) {
            // if (userAssetData.currencyAddress.toUpperCase() != keys.ethaddress.toUpperCase()) {
            //     const slashminabii = JSON.parse(currencyData.minABI);
            //     const curminabi = slashminabii.replace(/\\|\//g, '')

            //     token_move_to_admin(
            //         userAssetData.currencyAddress,
            //         userAssetData.privateKey,
            //         keys.ethaddress,
            //         userAssetData.currencyAddress,
            //         userAssetData.userId._id,
            //         currencyData.decimals,
            //         curminabi,
            //         currencyData.contractAddress
            //     );
            // }

            let checkTransactionData = await Transaction.findOne({
                userId: userAssetData.userId._id,
                txid: transactionsData.hash
            })

            if (checkTransactionData) {
                return
            }

            if (transactionsData.tokenDecimal == "1") {
                var recamount = transactionsData.value / 10;
            } else if (transactionsData.tokenDecimal == "6") {
                var recamount = transactionsData.value / 1000000;
            }
            else if (transactionsData.tokenDecimal == "8") {
                var recamount = transactionsData.value / 100000000;
            }

            var currencyfromrespone;
            if (transactionsData.tokenSymbol == "????PC") {
                currencyfromrespone = "💲PC"
            } else {
                currencyfromrespone = transactionsData.tokenSymbol
            }

            var transactions = new Transaction();
            transactions["user_id"] = userAssetData.userId._id;
            transactions["currencyId"] = currencyData._id;
            transactions["fromaddress"] = transactionsData.from;
            transactions["toaddress"] = transactionsData.to;
            transactions["transferType"] = "TOUSER";
            transactions["amount"] = recamount;
            transactions["txid"] = transactionsData.hash;
            transactions["paymentType"] = 1;
            transactions["status"] = 3;

            var incdata = {};
            incdata["spotwallet"] = recamount;
            await transactions.save()

            await Assets.findOneAndUpdate(
                { '_id': userAssetData._id },
                { $inc: incdata },
                { new: true, fields: { balance: 1 } },
            );
            return
        } else {
            return
        }
    }
    catch (err) {
    }
}

export const updateDeposit = async (transactionsData, currencyData) => {
    try {
        if (isEmpty(transactionsData.to)) {
            return
        }
        let userAssetData = await Assets.findOne(
            {
                'currencyAddress': {
                    '$regex': new RegExp('.*' + transactionsData.to.toLowerCase() + '.*', 'i')
                }
            }
        ).populate({ path: "userId", select: "email _id" })

        if (userAssetData) {
            let respData = await axios({
                'method': 'post',
                'url': `${config.COIN_GATE_WAY.ETH.URL}/getBalance`,
                data: {
                    'address': userAssetData.currencyAddress,
                }
            });

            if (respData && respData.data) {

                if (userAssetData.currencyAddress.toUpperCase() != config.coinGateway.eth.address.toUpperCase()) {
                    amountMoveToAdmin({
                        'userAddress': userAssetData.currencyAddress,
                        'userPrivateKey': userAssetData.privateKey,
                    });
                }
                const { balance } = respData.data.result;
                if (balance > 0) {

                    let checkTransactionData = await Transaction.findOne({
                        userId: userAssetData.userId._id,
                        txid: transactionsData.hash
                    })
                    if (checkTransactionData) {
                        return
                    }

                    let fromWeiRespData = await axios({
                        'method': 'post',
                        'url': `${config.COIN_GATE_WAY.ETH.URL}/fromWei`,
                        data: {
                            'balance': transactionsData.value,
                        }
                    });

                    if (fromWeiRespData && fromWeiRespData.data) {
                        const { amount } = fromWeiRespData.data.result;

                        let transactions = new Transaction();
                        transactions["userId"] = userAssetData.userId._id;
                        transactions["currencyId"] = currencyData._id;
                        transactions["fromaddress"] = transactionsData.from;
                        transactions["toaddress"] = transactionsData.to;
                        transactions["transferType"] = "TOUSER";
                        transactions["amount"] = amount;
                        transactions["txid"] = transactionsData.hash;
                        transactions["status"] = 3;
                        transactions["paymentType"] = 1;
                        // transactions["createdAt"] = 1;

                        let newTransactions = await transactions.save();
                        await Assets.updateOne(
                            { "_id": userAssetData._id },
                            {
                                "$inc": {
                                    'spotwallet': amount
                                }
                            }
                        )

                    }
                    return
                } else {
                    return
                }
            } else {
                return
            }
        } else {
            return
        }
    }
    catch (err) {
        return
    }
}

// export const amountMoveToAdmin = async ({ userAddress, userPrivateKey }) => {
//     try {
//         let respData = await axios({
//             'method': 'post',
//             'url': `${config.COIN_GATE_WAY.ETH.URL}/amountMoveToAdmin`,
//             'data': {
//                 userAddress,
//                 userPrivateKey,
//                 adminAddress: config.coinGateway.eth.address
//             }
//         });

//         if (respData && respData.data) {
//             return
//         } else {
//             return
//         }
//     }
//     catch (err) {
//         return
//     }
// }

export const amountMoveToUser = async (data) => {
    try {

        let respData = await axios({
            'method': 'post',
            'url': `${config.COIN_GATE_WAY.ETH.URL}/eth-move-to-user`,
            data
        });
        if (respData && respData.status == 200) {
            return {
                'status': true,
                'data': respData.data.data
            }
        } else {
            return {
                status: false,
                message: "Some error"
            }
        }
    }
    catch (err) {
        return {
            status: false,
            message: err.response.data.message
        }
    }
}

export const tokenMoveToUser = async (data) => {
    try {
        let respData = await axios({
            'method': 'post',
            'url': `${config.COIN_GATE_WAY.ETH.URL}/erc20-token-move-to-user`,
            data
        });
        if (respData && respData.status == 200) {
            return {
                status: true,
                data: respData.data.data
            }
        } else {
            return {
                status: false,
                message: "Some error"
            }
        }
    } catch (err) {
        return {
            status: false,
            message: err.response.data.message
        }
    }
}

// async function example(){
//    let currencyData = await Currency.find({});
//    for(let i=0;i<currencyData.length;i++){
//      let data = await Assets.findOneAndUpdate(
//         {userId:ObjectId("61cc2578f175fe299929e3f4"),currencySymbol:currencyData[i].currencySymbol},
//         {$set:{currencyAddress:"",privateKey:""}},
//         {new:true}
//     )
//    }
// }

// example();