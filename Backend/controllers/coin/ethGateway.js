// import package
import axios from 'axios';
import https from 'https';
import converter from 'hex2dec';
import querystring from 'querystring'
import Web3 from 'web3'

// import modal
import Currency from '../../models/currency';
import Assets from '../../models/Assets';
import Transaction from '../../models/Transaction';

// import config
import config from '../../config';

// import lib
import isEmpty from '../../lib/isEmpty';
import isJsonParse from '../../lib/isJsonParse';

const web3 = new Web3();

export const createAddress = async () => {
    try {
        let respData = await axios({
            'method': 'post',
            'url': `${config.coinGateway.eth.url}/newAddress`
        });
        if (respData && respData.status == 200 && !isEmpty(respData.data.result)) {
            const { address, privateKey } = respData.data.result;
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
export const deposit = async () => {
    try {
        let currencyData = await Currency.findOne({ "currencySymbol": 'ETH' }, { 'block': 1 })
        if (currencyData) {
            let max_blocknumber = currencyData.block;
            let params = querystring.stringify(config.coinGateway.eth.blockDetail);
            https.get(config.coinGateway.eth.etherscanUrl + params, (resp) => {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    let responseTxn = isJsonParse(data);
                    if (responseTxn && responseTxn.result != null) {
                        let count = converter.hexToDec(responseTxn.result);
                        max_blocknumber = 9761682
                        count = 9761683
                        if (max_blocknumber < count) {
                            getTransactionList(max_blocknumber, count, currencyData)
                        }
                    }
                });
            }).on("error", (err) => {
            });
        } else {
            return
        }
    }
    catch (err) {
        return
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
                'url': `${config.coinGateway.eth.url}/getBalance`,
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
                        'url': `${config.coinGateway.eth.url}/fromWei`,
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

export const amountMoveToAdmin = async ({ userAddress, userPrivateKey }) => {
    try {
        let respData = await axios({
            'method': 'post',
            'url': `${config.coinGateway.eth.url}/amountMoveToAdmin`,
            'data': {
                userAddress,
                userPrivateKey,
                adminAddress: config.coinGateway.eth.address
            }
        });

        if (respData && respData.data) {
            return
        } else {
            return
        }
    }
    catch (err) {
        return
    }
}

export const amountMoveToUser = async ({ userAddress, amount }) => {
    try {
        let respData = await axios({
            'method': 'post',
            'url': `${config.coinGateway.eth.url}/amountMoveToUser`,
            'data': {
                userAddress,
                amount,
                adminPrivateKey: config.coinGateway.eth.privateKey,
                adminAddress: config.coinGateway.eth.address
            }
        });

        if (respData && respData.status == 200) {
            return {
                status: true,
                trxId: respData.data.result.txHash
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

export const tokenMoveToUser = async ({ amount, userAddress, minAbi, contractAddress }) => {
    try {
        let respData = await axios({
            'method': 'post',
            'url': `${config.coinGateway.eth.url}/tokenMoveToUser`,
            'data': {
                userAddress,
                amount,
                adminPrivateKey: config.coinGateway.eth.privateKey,
                adminAddress: config.coinGateway.eth.address
            }
        });

        if (respData && respData.status == 200) {
            return {
                status: true,
                trxId: respData.data.result.txHash
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

export const isAddress = (address) => {
    try {
        if (isEmpty(address)) {
            return false
        }

        return web3.utils.isAddress(address)

    } catch (err) {
        return false
    }
}