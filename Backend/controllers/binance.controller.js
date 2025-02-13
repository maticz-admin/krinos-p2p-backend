// import package
import mongoose from 'mongoose';
import lodash from 'lodash';
import axios from 'axios';

// import config
import config from '../config';
import { nodeBinanceAPI, binanceApiNode } from '../config/binance';
import { socketEmitOne, socketEmitAll } from '../config/socketIO';
import { binDepHisTask, binOrderTask } from '../config/cron'

// import controller
import { triggerStopLimitOrder, trailingStopOrder, assetUpdate } from './spotTrade.controller';
import { mailTemplateLang } from './emailTemplate.controller';

// import model
import {
    SpotPair,
    SpotTrade,
    SiteSetting,
    Transaction,
    Wallet,
    User
} from '../models';

// import lib
import isEmpty from '../lib/isEmpty';
import { replacePair } from '../lib/pairHelper';
import { makeQueryString } from '../lib/JSHelper';
import { createHmac } from '../lib/crypto';
import { getTimeStamp, } from '../lib/dateHelper';
import { toFixed } from '../lib/roundOf'
import { withoutServiceFee, calculateServiceFee } from '../lib/calculation'

axios.defaults.baseURL = config.BINANCE_GATE_WAY.API_URL;
axios.defaults.headers.common['X-MBX-APIKEY'] = config.BINANCE_GATE_WAY.API_KEY;
// const new ObjectId = mongoose.Types.new ObjectId;
const { ObjectId } = require('mongoose').Types;


let partialDepth, tikerData, recentData;

export const spotOrderBookWS = async () => {
    try {
        if (partialDepth) {
            partialDepth()
        }
        let getSpotPair = await SpotPair.aggregate([
            { "$match": { 'botstatus': 'binance' } },
            {
                "$project": {
                    '_id': 1,
                    'symbol': {
                        "$concat": [
                            "$firstCurrencySymbol",
                            {
                                "$switch": {
                                    "branches": [
                                        { "case": { "$eq": ["$secondCurrencySymbol", 'USD'] }, then: "USDT" },
                                    ],
                                    "default": "$secondCurrencySymbol"
                                }
                            },
                        ]
                    },
                    'level': { "$literal": 20 },
                    'markupPercentage': 1
                }
            }
        ])

        if (getSpotPair && getSpotPair.length > 0) {

            partialDepth = binanceApiNode.ws.partialDepth(getSpotPair, async (depth) => {
                if (depth) {

                    let pairData = getSpotPair.find((el) => el.symbol == depth.symbol)

                    if (pairData) {

                        // sell order book
                        let sellOrder = [], binanceSellOrder = depth.asks;
                        let sellOrderData = await SpotTrade.aggregate([
                            {
                                "$match": {
                                    "pairId": new ObjectId(pairData._id),
                                    "$or": [
                                        { "status": "open" },
                                        { "status": "pending" },
                                    ],
                                    'buyorsell': 'sell'
                                }
                            },
                            {
                                "$group": {
                                    '_id': "$price",
                                    'quantity': { "$sum": "$quantity" },
                                    'filledQuantity': { "$sum": "$filledQuantity" },
                                }
                            },
                            { "$sort": { "_id": 1 } },
                            { "$limit": 10 }
                        ])

                        sellOrder = sellOrderData;
                        for (let sellItem of binanceSellOrder) {

                            let orderData = sellOrderData.find((x) => x._id === parseFloat(sellItem.price));
                            if (!orderData) {

                                sellOrder.push({
                                    '_id': calculateMarkup(sellItem.price, pairData.markupPercentage, '+'),
                                    'quantity': parseFloat(sellItem.quantity),
                                    'filledQuantity': 0
                                })
                            }
                        }


                        
                        sellOrder = sellOrder.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

                        if (sellOrder.length > 0) {
                            let sumAmount = 0
                            for (let i = 0; i < sellOrder.length; i++) {
                                let quantity = parseFloat(sellOrder[i].quantity) - parseFloat(sellOrder[i].filledQuantity);
                                sumAmount = parseFloat(sumAmount) + parseFloat(quantity);
                                sellOrder[i].total = sumAmount;
                                sellOrder[i].quantity = quantity;
                            }
                        }
                        sellOrder = sellOrder.reverse();


                        // buy order book
                        let buyOrder = [], binanceBuyOrder = depth.bids;

                        let buyOrderData = await SpotTrade.aggregate([
                            {
                                "$match": {
                                    "pairId": new ObjectId(pairData._id),
                                    "$or": [
                                        { "status": "open" },
                                        { "status": "pending" },
                                    ],
                                    'buyorsell': 'buy'
                                }
                            },
                            {
                                "$group": {
                                    '_id': "$price",
                                    'quantity': { "$sum": "$quantity" },
                                    'filledQuantity': { "$sum": "$filledQuantity" },
                                }
                            },
                            { "$sort": { "_id": -1 } },
                            { "$limit": 10 }
                        ])

                        buyOrder = buyOrderData;

                        for (let buyItem of binanceBuyOrder) {
                            let orderData = buyOrderData.find((x) => x._id === parseFloat(buyItem.price));
                            if (!orderData) {
                                buyOrder.push({
                                    '_id': calculateMarkup(buyItem.price, pairData.markupPercentage, '-'),
                                    'quantity': parseFloat(buyItem.quantity),
                                    'filledQuantity': 0
                                })
                            }
                        }

                        buyOrder = buyOrder.sort((a, b) => parseFloat(b._id) - parseFloat(a._id));

                        if (buyOrder.length > 0) {
                            let sumAmount = 0
                            for (let i = 0; i < buyOrder.length; i++) {
                                let quantity = parseFloat(buyOrder[i].quantity) - parseFloat(buyOrder[i].filledQuantity);
                                sumAmount = parseFloat(sumAmount) + parseFloat(quantity);
                                buyOrder[i].total = sumAmount;
                                buyOrder[i].quantity = quantity;
                            }
                        }

                        socketEmitAll('orderBook', {
                            'pairId': pairData._id,
                            'sellOrder': sellOrder,
                            'buyOrder': buyOrder,
                        })
                    }
                }
            })
        }

    } catch (err) {
        console.log("Error on websocketcall in binanceHelper ", err)
    }
}

export const spotTickerPriceWS = async () => {
    try {
        if (tikerData) {
            tikerData()
        }
        let getSpotPair = await SpotPair.aggregate([
            { "$match": { 'botstatus': 'binance' } },
            {
                "$group": {
                    '_id': null,
                    'symbol': {
                        "$push": {
                            "$concat": [
                                "$firstCurrencySymbol",
                                {
                                    "$switch": {
                                        "branches": [
                                            { "case": { "$eq": ["$secondCurrencySymbol", 'USD'] }, then: "USDT" },
                                        ],
                                        "default": "$secondCurrencySymbol"
                                    }
                                },
                            ]
                        }
                    },
                    'pairData': {
                        "$push": {
                            "pairId": "$_id",
                            'symbol': {
                                "$concat": [
                                    "$firstCurrencySymbol",
                                    {
                                        "$switch": {
                                            "branches": [
                                                { "case": { "$eq": ["$secondCurrencySymbol", 'USD'] }, then: "USDT" },
                                            ],
                                            "default": "$secondCurrencySymbol"
                                        }
                                    },
                                ]
                            }

                        }
                    }
                }
            }
        ])

        if (getSpotPair && getSpotPair.length > 0 && getSpotPair[0].symbol && getSpotPair[0].symbol.length > 0) {
            tikerData = binanceApiNode.ws.ticker(getSpotPair[0].symbol, async tickerdata => {
                let pairData = getSpotPair[0].pairData.find(el => el.symbol == tickerdata.symbol);
                if (pairData) {
                    let updateSpotPair = await SpotPair.findOneAndUpdate({
                        '_id': pairData.pairId
                    }, {
                        'low': tickerdata.low,
                        'high': tickerdata.high,
                        'changePrice': tickerdata.priceChange,
                        'change': tickerdata.priceChangePercent,
                        'firstVolume': tickerdata.volume,
                        'secondVolume': tickerdata.volumeQuote,
                        'last': tickerdata.bestBid,
                        'markPrice': tickerdata.bestBid,
                    }, {
                        'new': true,
                        "fields": {
                            "last": 1,
                            "markPrice": 1,
                            "low": 1,
                            "high": 1,
                            "firstVolume": 1,
                            "secondVolume": 1,
                            "changePrice": 1,
                            "change": 1,
                            "botstatus": 1,
                        }
                    })

                    socketEmitAll('marketPrice', {
                        'pairId': pairData.pairId,
                        'data': updateSpotPair
                    })

                    triggerStopLimitOrder(updateSpotPair)
                    trailingStopOrder(updateSpotPair)
                }
            })
        }
    } catch (err) {
        console.log("Error on ticker binance ", err)
    }
}

/**
 * Account Info
*/
export const accountInfo = async () => {
    try {
        let accountInfo = await binanceApiNode.accountInfo();
        if (accountInfo) {
            return {
                status: true,
                data: accountInfo
            };
        }
        return {
            status: false,
            message: 'Error occured'
        };
    } catch (err) {
        return {
            status: false,
            message: err.toString()
        };
    }
}

/**
 * Balance Info
 * BODY : currencySymbol
*/
export const balanceInfo = async ({ currencySymbol }) => {
    try {
        let info = await accountInfo();
        if (!info.status) {
            return {
                status: false,
                message: info.message
            };
        }

        let currencyBalance = info.data.balances.find((el => el.asset == currencySymbol))
        if (!currencyBalance) {
            return {
                status: false,
                message: "INVALID_CURRENCY"
            };
        }

        return {
            status: true,
            data: currencyBalance
        };

    } catch (err) {
        return {
            status: false,
            message: err.toString()
        };
    }
}
balanceInfo({ currencySymbol: "USDT" })
balanceInfo({ currencySymbol: "BNB" })
/**
 * Check Currency Balance
 * BODY : firstCurrency, secondCurrency, buyorsell, price, quantity
*/
export const checkBalance = async ({
    firstCurrencySymbol,
    secondCurrencySymbol,
    buyorsell,
    price,
    quantity
}) => {
    try {
        let currencySymbol, orderValue;
        price = parseFloat(price);
        quantity = parseFloat(quantity);

        if (buyorsell == "buy") {
            currencySymbol = secondCurrencySymbol;
            orderValue = price * quantity;
        } else if (buyorsell == "sell") {
            currencySymbol = firstCurrencySymbol;
            orderValue = quantity;
        }

        let balanceData = await balanceInfo({ currencySymbol })
        if (!balanceData.status) {
            return {
                status: false,
                message: balanceData.message
            }
        }

        if (parseFloat(balanceData.data.free) > orderValue) {
            return {
                status: true
            }
        } else {
            return {
                status: false,
                message: "INSUFFIENT_BALANCE"
            }
        }

    } catch (err) {
        return {
            status: false,
            message: err.toString()
        }
    }
}

/** 
 * Binance Order Place
 * firstCurrencySymbol, secondCurrencySymbol, buyorsell, price, quantity, orderType (limit, market, stop_limit, stop_market), markupPercentage, minimumValue
*/
export const orderPlace = async (reqBody) => {
    try {
        // let reqBody = req.body;
        reqBody.quantity = parseFloat(reqBody.quantity);
        reqBody.price = parseFloat(reqBody.price);

        const checkBinanceBalance = await checkBalance({
            'firstCurrencySymbol': reqBody.firstCoin,
            'secondCurrencySymbol': replacePair(reqBody.secondCoin),
            'buyorsell': reqBody.side,
            'price': reqBody.price,
            'quantity': reqBody.quantity
        })
        if (!checkBinanceBalance.status) {
            return {
                status: false,
                message: checkBinanceBalance.message
            }
        }

        if (reqBody.orderType == 'limit') {
            return await limitOrderPlace({
                'price': reqBody.price,
                'quantity': reqBody.quantity,
                'buyorsell': reqBody.side,
                'markupPercentage': reqBody.markupPercentage,
                'minimumValue': reqBody.minimumValue,
                'firstCurrencySymbol': reqBody.firstCoin,
                'secondCurrencySymbol': reqBody.secondCoin,
            })
        } else if (reqBody.orderType == 'market') {
            // return await marketOrderPlace()
        } else if (reqBody.orderType == 'stop_limit') {
            return await stopLimitOrderPlace({
                'price': reqBody.price,
                'stopPrice': reqBody.stopPrice,
                'quantity': reqBody.quantity,
                'side': reqBody.side,
                'markupPercentage': reqBody.markupPercentage,
                'minimumValue': reqBody.minimumValue,
                'firstCoin': reqBody.firstCoin,
                'secondCoin': reqBody.secondCoin,
                'markPrice': reqBody.markPrice
            })
        }

        return {
            status: false,
            message: 'Error occured'
        }
    } catch (err) {
        return {
            status: false,
            message: err.toString()
        }
    }
}

const filter = {
    'BNBUSDT': {
        'size': 1
    },
    'ETHUSDT': {
        'size': 2
    },
    'BTCUSDT': {
        'size': 2
    },
}
export const limitOrderPlace = async ({
    price,
    quantity,
    buyorsell,
    markupPercentage,
    minimumValue,
    firstCurrencySymbol,
    secondCurrencySymbol,
}) => {
    try {
        price = parseFloat(price);
        quantity = parseFloat(quantity);

        let withMarkupPrice;

        if (buyorsell == "buy") {
            withMarkupPrice = calculateMarkup(price, markupPercentage, '-')
        } else if (buyorsell == "sell") {
            withMarkupPrice = calculateMarkup(price, markupPercentage, '+')
        }
        let filterDoc = filter[firstCurrencySymbol + secondCurrencySymbol]
        if (!filterDoc) {
            return {
                status: false,
                message: 'Order value error'
            }
        }

        withMarkupPrice = toFixed(withMarkupPrice, filterDoc.size)
        let orderValue = quantity * withMarkupPrice;

        if (orderValue >= minimumValue) {
            let orderOption = {
                symbol: firstCurrencySymbol + secondCurrencySymbol,
                side: buyorsell.toUpperCase(),
                type: "LIMIT",
                quantity: quantity,
                price: withMarkupPrice
            }

            let neworder = await binanceApiNode.order(orderOption);

            if (!neworder) {
                return {
                    status: false,
                    message: 'Error occured'
                }
            }
            return {
                status: true,
                data: neworder
                // data: {
                //     "orderId": neworder.orderId,
                //     "status": neworder.status,
                //     "executedQty": neworder.executedQty,
                //     "origQty": neworder.origQty
                // }
            }
        } else {
            return {
                status: false,
                message: 'Order value error'
            }
        }
    } catch (err) {
        return {
            status: false,
            message: err.toString()
        }
    }
}

export const marketOrderPlace = async ({
    firstCoin,
    secondCoin,
    side,
    quantity,
}) => {
    try {
        quantity = parseFloat(quantity);

        let orderOption = {
            symbol: firstCoin + secondCoin,
            side: side.toUpperCase(),
            type: "MARKET",
            quantity: quantity,
        }

        let neworder = await binanceApiNode.order(orderOption);
        if (!neworder) {
            return {
                status: false,
                message: 'Error occured'
            }
        }
        return {
            status: true,
            data: neworder
        }
    } catch (err) {
        return {
            status: false,
            message: err.toString()
        }
    }
}

export const stopLimitOrderPlace = async ({
    firstCoin,
    secondCoin,
    price,
    stopPrice,
    quantity,
    side,
    markPrice,
    markupPercentage
}) => {
    try {
        price = parseFloat(price);
        quantity = parseFloat(quantity);
        stopPrice = parseFloat(stopPrice);
        markPrice = parseFloat(markPrice)

        let markupMarkPrice = calculateMarkup(markPrice, markupPercentage, '-')
        let type, markupPrice, markupStopPrice;

        let filterDoc = filter[firstCoin + secondCoin]
        if (!filterDoc) {
            return {
                status: false,
                message: 'Order filter error'
            }
        }

        if (side == "buy") {
            markupPrice = calculateMarkup(price, markupPercentage, '-')
            if (((markupMarkPrice < stopPrice && stopPrice < markupPrice.toFixed(filterDoc.size)) || (markupMarkPrice < stopPrice && stopPrice > markupPrice.toFixed(filterDoc.size)))) {
                type = "STOP_LOSS_LIMIT"
            }
            else if (((markupMarkPrice > stopPrice && stopPrice > markupPrice.toFixed(filterDoc.size)) || (markupMarkPrice > stopPrice && stopPrice < markupPrice.toFixed(filterDoc.size)))) {
                type = "TAKE_PROFIT_LIMIT"
            }
            markupStopPrice = stopPrice
        } else if (side == "sell") {
            markupPrice = calculateMarkup(price, markupPercentage, '+')
            if (((markupMarkPrice > stopPrice && stopPrice < markupPrice.toFixed(filterDoc.size)) || (markupMarkPrice > stopPrice && stopPrice > markupPrice.toFixed(filterDoc.size)))) {
                type = "STOP_LOSS_LIMIT"
            }
            else if (((markupMarkPrice < stopPrice && stopPrice < markupPrice.toFixed(filterDoc.size)) || (markupMarkPrice < stopPrice && stopPrice > markupPrice.toFixed(filterDoc.size)))) {
                type = "TAKE_PROFIT_LIMIT"
            }
            markupStopPrice = stopPrice
        }

        let orderOption = {
            symbol: firstCoin + secondCoin,
            side: side.toUpperCase(),
            type: type,
            quantity: quantity,
            price: markupPrice.toFixed(filterDoc.size),
            stopPrice: markupStopPrice.toFixed(filterDoc.size)
        }

        let neworder = await binanceApiNode.order(orderOption);
        if (!neworder) {
            return {
                status: false,
                message: 'Error occured'
            }
        }
        return {
            status: true,
            data: neworder
        }
    } catch (err) {
        return {
            status: false,
            message: err.toString()
        }
    }
}

export const calculateMarkup = (price, percentage, type = '+') => {
    price = parseFloat(price);
    percentage = parseFloat(percentage)

    if (!isEmpty(price)) {
        if (type == '+') {
            return price + (price * (percentage / 100))
        } else if (type == '-') {
            return price - (price * (percentage / 100))
        }
    }
    return 0
}

/** 
 * Cancel Order
 * symbol
*/
export const cancelOrder = async ({
    firstCoin,
    secondCoin,
    binanceId,
    orderType
},
    apiKey = config.BINANCE_GATE_WAY.API_KEY,
    apiSecret = config.BINANCE_GATE_WAY.API_SECRET
) => {
    try {
        let cancelOrder;
        if (orderType == 'Oco') {
            cancelOrder = await binanceApiNode.cancelOrderOco({
                'symbol': firstCoin + secondCoin,
                'orderId': binanceId
            })
        } else {
            cancelOrder = await binanceApiNode.cancelOrder({
                'symbol': firstCoin + secondCoin,
                'orderId': binanceId
            })
        }

        if (cancelOrder) {
            return {
                status: true,
                data: cancelOrder
            }
        } else {
            return {
                status: false,
                message: 'Error occued'
            }
        }
    } catch (err) {
        return {
            status: false,
            message: err.toString()
        }
    }
}

/**
 * Get Order Status
 * BODY : pairName, binanceOrderId
*/
export const orderStatus = async ({ pairName, binanceOrderId }) => {
    try {
        var orderstatus = await binanceApiNode.getOrder({
            symbol: pairName,
            orderId: binanceOrderId,
        });
        if (orderstatus) {
            return {
                status: true,
                data: orderstatus
            }
        } else {
            return {
                status: false
            }
        }
    } catch (err) {
        return {
            status: false
        }
    }
}

/** 
 * Check Binance Order Status
*/
export const checkStatus = async (req, res) => {
    try {
        let orderData = await SpotTrade.find({ "binType": true, "status": { "$in": ['open', 'pending'] } });
        if (orderData && orderData.length > 0) {
            for (let item of orderData) {
                if (!isEmpty(item.binorderId)) {
                    const orderStatus = await orderStatus({
                        'pairName': item.firstCurrency + item.secondCurrency,
                        'binanceOrderId': item.binorderId
                    })

                    if (orderStatus.status) {
                        respArray.push({
                            "binanceOrderId": orderStatus.data.orderId,
                            "binanceStatus": orderStatus.data.status,
                            "executedQty": orderStatus.data.executedQty,
                            "origQty": orderStatus.data.origQty
                        })
                    }

                }
            }
        }

    } catch (err) {
    }
}

/** 
 * Recent Trade
*/
export const recentTrade = async ({ firstCurrencySymbol, secondCurrencySymbol }) => {
    try {
        secondCurrencySymbol = replacePair(secondCurrencySymbol)
        let recentTradeData = await binanceApiNode.trades({ 'symbol': firstCurrencySymbol + secondCurrencySymbol, "limit": 50 })
        let recentTrade = [];
        recentTradeData.filter((el => {
            recentTrade.push({
                'createdAt': new Date(el.time),
                'Type': el.isBuyerMaker ? 'buy' : 'sell',
                'price': el.price,
                'filledQuantity': el.qty,
            })
        }))

        return recentTrade

    } catch (err) {
        console.log("\x1b[31m", 'Error on binance trade list')
        return []
    }

}

export const getSpotPair = async () => {
    try {
        let pairLists = await SpotPair.find(
            { "botstatus": 'binance' },
            {
                'firstCurrencySymbol': 1,
                'secondCurrencySymbol': 1,
            }
        );

        if (pairLists && pairLists.length > 0) {
            recentTradeWS(pairLists)
        }
        return true
    } catch (err) {
        return false
    }
}

export const recentTradeWS = async (pairList) => {
    try {
        if (recentData) {
            recentData()
        }

        let symbolList = lodash.map(pairList, (item) => {
            return item.firstCurrencySymbol + replacePair(item.secondCurrencySymbol)
        });

        if (symbolList && symbolList.length > 0) {
            recentData = binanceApiNode.ws.trades(symbolList, async trade => {
                if (trade) {
                    let pairData = pairList.find(el => el.firstCurrencySymbol + replacePair(el.secondCurrencySymbol) == trade.symbol)
                    let recentTrade = [{
                        'createdAt': new Date(trade.tradeTime),
                        'Type': trade.isBuyerMaker ? 'buy' : 'sell',
                        'price': trade.price,
                        'filledQuantity': trade.quantity,
                    }]

                    socketEmitAll('recentTrade', {
                        'pairId': pairData._id,
                        'data': recentTrade
                    })
                }
            })
        }
    } catch (err) {
        console.log("Error on recentTradeWS")
    }
}

export const marketPrice = async () => {
    try {
        return binanceApiNode.prices()
    } catch (err) {
        return ''
    }
}

export const depositAddress = async (currencySymbol) => {
    try {
        return {
            ...await binanceApiNode.depositAddress({ 'coin': currencySymbol }),
            'status': true
        }
    } catch (err) {
        return {
            'status': false
        }
    }
}

export const withdraw = async (coin, address, amount) => {
    try {
        let data = await binanceApiNode.withdraw({
            'asset': coin,
            'address': address,
            'amount': amount,
        })
        return {
            'status': true,
            'trxId': data.id,
        }
    } catch (err) {
        return {
            'status': false,
            'trxId': ''
        }
    }
}

export const generateSign = (secretKey, payload = {}) => {
    let payloadString = makeQueryString(payload)
    let signature = createHmac('sha256', secretKey)
    signature.update(payloadString)
    return signature.digest('hex');
}

/** 
 * Create Sub Account
 * tag(required=false, max=32), recvWindow(required=false), timestamp(required=true)
*/
export const newSubAcc = async (userId) => {
    try {
        let payload = {
            'tag': userId,
            'timestamp': getTimeStamp()
        }
        payload['signature'] = generateSign(config.BINANCE_GATE_WAY.API_SECRET, payload)

        const respData = await axios({
            'url': `/sapi/v1/broker/subAccount`,
            'method': 'post',
            'params': payload
        })

        return {
            'status': true,
            'subaccountId': respData.data.subaccountId,
            'email': respData.data.email,
        }
    } catch (err) {
        return {
            'status': false,
            'subaccountId': '',
            'email': '',
        }
    }
}

/** 
 * Get Sub-account Deposit Address (For Master Account)
 * email(required=true), coin(required=true), timestamp(required=true)
*/
export const subAccDepAddr = async (reqData) => {
    try {
        if (isEmpty(reqData)) {
            return {
                'status': false,
            }
        }

        let payload = {
            'email': reqData.email,
            'coin': reqData.coin,
            'timestamp': getTimeStamp()
        }
        payload['signature'] = generateSign(config.BINANCE_GATE_WAY.API_SECRET, payload)

        const respData = await axios({
            'url': `/sapi/v1/capital/deposit/subAddress`,
            'method': 'get',
            'params': payload
        })
        return {
            'status': true,
            'coin': respData.data.coin,
            'address': respData.data.address,
            'tag': respData.data.tag,
        }
    } catch (err) {
        return {
            'status': false,
        }
    }
}

/** 
 * Get Sub-account Deposit History
 * subAccountId(required=false), coin(required=false), status(0:pending,6: credited but cannot withdraw, 1:success), startTime(required=false,Default: 7 days from current timestamp), endTime(required=false,Default: present timestamp), limit(required=false,Default: Default：500), offest(required=false,Default: Default：0), recvWindow(required=false), timestamp(required=true), 
*/
export const subAccDepHis = async (reqData) => {
    try {
        let payload = {
            'startTime': reqData.startTime,
            'endTime': reqData.endTime,
            'status': 1,
            'timestamp': getTimeStamp()
        }
        payload['signature'] = generateSign(config.BINANCE_GATE_WAY.API_SECRET, payload)

        const respData = await axios({
            'url': `/sapi/v1/broker/subAccount/depositHist`,
            'method': 'get',
            'params': payload
        })
        return {
            'status': true,
            'history': respData.data
        }
    } catch (err) {
        return {
            'status': false,
        }
    }
}

/** 
 * Internal Transfer
 * fromId(required=false), toId(required=false), clientTranId(required=false), asset(required=true), amount(required=true), recvWindow(required=false), timestamp(required=true), 
*/
export const tranferToMaster = async (reqData) => {
    try {
        let payload = {
            'fromId': reqData.fromId,
            'asset': reqData.asset,
            'amount': reqData.amount,
            'timestamp': getTimeStamp()
        }
        payload['signature'] = generateSign(config.BINANCE_GATE_WAY.API_SECRET, payload)

        const respData = await axios({
            'url': `/sapi/v1/broker/transfer`,
            'method': 'post',
            'params': payload
        })
        return {
            'status': true,
        }
    } catch (err) {
        return {
            'status': false,
        }
    }
}

/**
 * Check Binance Order
 */
binOrderTask.start()
export const checkOrder = async () => {
    binOrderTask.stop()
    try {
        const orderList = await SpotTrade.find({
            'isLiquidity': true,
            'liquidityType': 'binance',
            'status': { "$in": ['open', 'pending', 'conditional'] }
        })
        if (orderList && orderList.length > 0) {
            for (let orderData of orderList) {
                let binOrder = await orderStatus({
                    'pairName': orderData.firstCurrency + orderData.secondCurrency,
                    'binanceOrderId': parseFloat(orderData.liquidityId)
                })
                if (binOrder.status) {
                    let pairData = await SpotPair.findOne({ "_id": orderData.pairId })
                    let binData = binOrder.data;

                    if (pairData && binOrder.data.status == "PARTIALLY_FILLED") {
                        let uniqueId = Math.floor(Math.random() * 1000000000);
                        let filledQty = Math.abs(orderData.filledQuantity - binData.executedQty)

                        await SpotTrade.findOneAndUpdate({
                            '_id': orderData._id
                        }, {
                            'status': 'pending',
                            'filledQuantity': orderData.filledQuantity + filledQty,
                            "$push": {
                                "filled": {
                                    "pairId": orderData.pairId,
                                    // "sellUserId": orderData.buyorsell == 'sell' ? orderData.userId : newOrder.userId,
                                    // "buyUserId": orderData[count].buyorsell == 'buy' ? orderData[count].userId : newOrder.userId,
                                    "userId": orderData.userId,
                                    // "sellOrderId": orderData.buyorsell == 'sell' ? orderData._id : newOrder._id,
                                    // "buyOrderId": orderData[count].buyorsell == 'buy' ? orderData[count]._id : newOrder._id,
                                    "uniqueId": uniqueId,
                                    "price": orderData.price,
                                    "filledQuantity": filledQty,
                                    "Fees": calculateServiceFee({
                                        'price': orderData.buyorsell == 'sell' ? orderData.price * filledQty : filledQty,
                                        'serviceFee': pairData.taker_fees
                                    }),
                                    "status": "filled",
                                    "Type": orderData.buyorsell,
                                    "createdAt": new Date(),
                                    "orderValue": orderData.price * filledQty,
                                }
                            }
                        }, { 'new': true });


                        await assetUpdate({
                            'currencyId': orderData.buyorsell == 'sell' ? orderData.secondCurrencyId : orderData.firstCurrencyId,
                            'userId': orderData.userId,
                            'balance': withoutServiceFee({
                                'price': orderData.buyorsell == 'sell' ? orderData.price * filledQty : filledQty,
                                'serviceFee': pairData.taker_fees
                            }),
                        })

                    } else if (pairData && binOrder.data.status == "FILLED") {
                        let uniqueId = Math.floor(Math.random() * 1000000000);
                        let filledQty = Math.abs(orderData.filledQuantity - binData.executedQty)

                        await SpotTrade.findOneAndUpdate({
                            '_id': orderData._id
                        }, {
                            'status': 'completed',
                            'filledQuantity': orderData.filledQuantity + filledQty,
                            "$push": {
                                "filled": {
                                    "pairId": orderData.pairId,
                                    // "sellUserId": orderData.buyorsell == 'sell' ? orderData.userId : newOrder.userId,
                                    // "buyUserId": orderData[count].buyorsell == 'buy' ? orderData[count].userId : newOrder.userId,
                                    "userId": orderData.userId,
                                    // "sellOrderId": orderData.buyorsell == 'sell' ? orderData._id : newOrder._id,
                                    // "buyOrderId": orderData[count].buyorsell == 'buy' ? orderData[count]._id : newOrder._id,
                                    "uniqueId": uniqueId,
                                    "price": orderData.price,
                                    "filledQuantity": filledQty,
                                    "Fees": calculateServiceFee({
                                        'price': orderData.buyorsell == 'sell' ? orderData.price * filledQty : filledQty,
                                        'serviceFee': pairData.taker_fees
                                    }),
                                    "status": "filled",
                                    "Type": orderData.buyorsell,
                                    "createdAt": new Date(),
                                    "orderValue": orderData.price * filledQty,
                                }
                            }
                        }, { 'new': true });


                        await assetUpdate({
                            'currencyId': orderData.buyorsell == 'sell' ? orderData.secondCurrencyId : orderData.firstCurrencyId,
                            'userId': orderData.userId,
                            'balance': withoutServiceFee({
                                'price': orderData.buyorsell == 'sell' ? orderData.price * filledQty : filledQty,
                                'serviceFee': pairData.taker_fees
                            }),
                        })


                    } else if (pairData && binOrder.data.status == "CANCELED") {

                        let filledQty = Math.abs(orderData.quantity - orderData.filledQuantity)
                        var cancelup = await SpotTrade.findOneAndUpdate({
                            '_id': orderData._id
                        }, {
                            'status': 'cancel',
                        }, { 'new': true });


                        await assetUpdate({
                            'currencyId': orderData.buyorsell == 'buy' ? orderData.secondCurrencyId : orderData.firstCurrencyId,
                            'userId': orderData.userId,
                            'balance': orderData.buyorsell == 'buy' ? orderData.price * filledQty : filledQty
                        })
                    }
                }
            }
        }
        binOrderTask.start()
    } catch (err) {
        binOrderTask.start()
    }
}

/** 
 * User Deposit Cron
*/
binDepHisTask.start()
export const usrDeposit = async () => {
    binDepHisTask.stop()
    try {
        let siteSetting = await SiteSetting.findOne({}, { "binanceDeposit": 1 });
        if (siteSetting) {
            let depositList = await subAccDepHis(siteSetting.binanceDeposit);
            if (depositList.status) {
                for (let item of depositList.history) {
                    let trxnData = await Transaction.findOne({
                        'coin': item.coin,
                        'txid': item.txId
                    });

                    if (!trxnData) {
                        let findWallet = {
                            'binSubAcctId': item.subAccountId,
                            'assets.coin': item.coin,
                            'assets.address': item.address
                        }
                        if (item.coin == 'XRP') {
                            findWallet['destTag'] = item.addressTag;
                        }

                        let usrWallet = await Wallet.findOneAndUpdate(findWallet, {
                            "$inc": {
                                "assets.$.spotBal": parseFloat(item.amount)
                            }
                        }, {
                            "select": {
                                "userId": 1,
                                "assets": {
                                    "$elemMatch": {
                                        "coin": item.coin,
                                        "address": item.address,
                                    }
                                }
                            },
                            "new": true
                        })

                        if (usrWallet && usrWallet.assets && usrWallet.assets.length > 0) {
                            let transactions = new Transaction();
                            transactions["userId"] = usrWallet.userId;
                            transactions["currencyId"] = usrWallet.assets[0]._id;
                            transactions["coin"] = usrWallet.assets[0].coin;
                            transactions["fromAddress"] = item.sourceAddress;
                            transactions["toAddress"] = item.address;
                            transactions["destTag"] = item.addressTag;
                            transactions["amount"] = item.amount;
                            transactions["actualAmount"] = item.amount;
                            transactions["txid"] = item.txId;
                            transactions["paymentType"] = 'coin_deposit';
                            transactions["type"] = 'binance';
                            transactions["status"] = 'completed';

                            await transactions.save();

                            await tranferToMaster({
                                'fromId': item.subAccountId,
                                'asset': item.coin,
                                'amount': parseFloat(item.amount),
                            });

                            let usrData = await User.findOne({ "userId": usrWallet.userId })
                            if (usrData) {
                                let content = {
                                    'email': usrData.email,
                                    'date': new Date(),
                                    'amount': parseFloat(item.amount).toFixed(8),
                                    'transactionId': item.txId,
                                    'currency': item.coin,
                                };

                                mailTemplateLang({
                                    'userId': usrData._id,
                                    'identifier': 'User_deposit',
                                    'toEmail': usrData.email,
                                    content
                                })

                            }
                        }
                    }
                }
            }
            if (depositList.history && depositList.history.length >= 500) {
                siteSetting.binanceDeposit.offest = siteSetting.binanceDeposit.offest + 1;
            }

            if (siteSetting.binanceDeposit.endTime < getTimeStamp('current')) {
                siteSetting.binanceDeposit.startTime = getTimeStamp('startTime');
                siteSetting.binanceDeposit.endTime = getTimeStamp('endTime')
                siteSetting.binanceDeposit.offest = 0;
            }
            await siteSetting.save();
            binDepHisTask.start()
        }
    } catch (err) {
        binDepHisTask.start()
    }
}

// -----item {
//     subAccountId: '2680834029786298368',
//     amount: '2',
//     coin: 'TRX',
//     network: 'TRX',
//     status: 1,
//     address: 'TYpz2SyYnuMmLBohtLTWVmwfZE1NB7ZoVd',
//     addressTag: '',
//     txId: 'dbdc4cee224c06a45c03ca5fbde72babc7740065b4938002c4c49d988eaad493',
//     insertTime: 1637909900000,
//     sourceAddress: 'TWY7xsiansC6PqSYLWQdY5LB1PBwHhfvaV',
//     confirmTimes: '1/1'
//   }

// Initial Function Call
getSpotPair();
spotOrderBookWS();
spotTickerPriceWS();