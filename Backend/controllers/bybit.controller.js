// import package
import WebSocket from 'ws';

// import model
import { PerpetualPair } from '../models'

// import config
import { socketEmitAll } from '../config/socketIO';

// import controller
import { forcedLiquidation, triggerProfitLoss } from './derivativeTrade.controller';

// import lib
import { splitPair } from '../lib/pairHelper'
import isEmpty from '../lib/isEmpty';

const ws = new WebSocket("wss://stream.bybit.com/realtime_public")

ws.on('open', function open() {
    ws.send('{"op": "subscribe", "args": ["instrument_info.100ms.XRPUSDT","instrument_info.100ms.BTCUSDT"]}')
});

ws.on("message", async function incoming(responseData) {
    try {
        if (responseData) {
            responseData = JSON.parse(responseData);
            if (/instrument_info.100ms/g.test(responseData.topic)) {
                if (responseData.type == 'snapshot') {
                    let { firstCurrency, secondCurrency } = splitPair(responseData.data.symbol);

                    let pairData = await PerpetualPair.findOne({
                        "firstCurrencySymbol": firstCurrency,
                        "secondCurrencySymbol": secondCurrency,
                    })

                    if (pairData) {
                        pairData.markPrice = responseData.data.index_price;

                        let updatePairData = await pairData.save();

                        let result = {
                            'last': updatePairData.last,
                            'markPrice': updatePairData.markPrice,
                            'low': updatePairData.low,
                            'high': updatePairData.high,
                            'firstVolume': updatePairData.firstVolume,
                            'secondVolume': updatePairData.secondVolume,
                            'changePrice': updatePairData.changePrice,
                            'change': updatePairData.change,
                            'botstatus': updatePairData.botstatus,
                        }

                        forcedLiquidation(updatePairData)
                        triggerProfitLoss(updatePairData)
                        socketEmitAll('perpetualMarketPrice', {
                            'pairId': updatePairData._id,
                            'data': result
                        })

                    }
                } else if (responseData.type == 'delta') {
                    if (responseData.data.update && responseData.data.update.length > 0) {
                        let { firstCurrency, secondCurrency } = splitPair(responseData.data.update[0].symbol);
                        let pairData = await PerpetualPair.findOne({
                            "firstCurrencySymbol": firstCurrency,
                            "secondCurrencySymbol": secondCurrency,
                        })

                        if (pairData) {
                            pairData.markPrice = isEmpty(responseData.data.update[0].index_price) ? pairData.markPrice : responseData.data.update[0].index_price;

                            let updatePairData = await pairData.save();

                            let result = {
                                'last': updatePairData.last,
                                'markPrice': updatePairData.markPrice,
                                'low': updatePairData.low,
                                'high': updatePairData.high,
                                'firstVolume': updatePairData.firstVolume,
                                'secondVolume': updatePairData.secondVolume,
                                'changePrice': updatePairData.changePrice,
                                'change': updatePairData.change,
                                'botstatus': updatePairData.botstatus,
                            }

                            forcedLiquidation(updatePairData)
                            triggerProfitLoss(updatePairData)
                            socketEmitAll('perpetualMarketPrice', {
                                'pairId': updatePairData._id,
                                'data': result
                            })

                        }
                    }
                }
            }
        }
    } catch (err) {
    }
})

ws.on("error", async function () {
})

/** 
 * Calculate order cost
*/
export const calculateInverseOrderCost = ({ price, quantity, leverage, takerFee, buyorsell }) => {
    try {
        price = parseFloat(price)
        quantity = parseFloat(quantity)
        leverage = parseFloat(leverage)
        takerFee = parseFloat(takerFee)

        return (
            inverseInitialMargin({ price, quantity, leverage })
            +
            inverseFeeToOpen({ price, quantity, takerFee })
            +
            inverseFeeToClose({ price, quantity, leverage, takerFee, buyorsell })
        )
    } catch (err) {
        return 0
    }
}

export const inverseInitialMargin = ({ price, quantity, leverage }) => {
    try {
        price = parseFloat(price)
        quantity = parseFloat(quantity)
        leverage = parseFloat(leverage)

        return quantity / (price * leverage)
    } catch (err) {
        return 0
    }
}

export const inverseFeeToOpen = ({ price, quantity, takerFee }) => {
    try {
        price = parseFloat(price)
        quantity = parseFloat(quantity)
        takerFee = parseFloat(takerFee)
        return (quantity / price) * (takerFee / 100)
    } catch (err) {
        return 0
    }
}

export const inverseFeeToClose = ({ price, quantity, leverage, takerFee, buyorsell }) => {
    try {
        price = parseFloat(price)
        quantity = parseFloat(quantity)
        takerFee = parseFloat(takerFee)

        return (quantity / inverseBankrupty({ price, leverage, buyorsell })) * (takerFee / 100)
    } catch (err) {
        return 0
    }
}

export const inverseBankrupty = ({ price, leverage, buyorsell }) => {
    try {
        price = parseFloat(price)
        leverage = parseFloat(leverage)

        if (buyorsell == 'buy') {
            return price * (leverage / (leverage + 1))
        } else if (buyorsell == 'sell') {
            return price * (leverage / (leverage - 1))
        }
        return 0
    } catch (err) {
        return 0
    }
}

export const isolatedLiquidationPrice = ({ buyorsell, price, leverage, maintanceMargin }) => {
    let liquidationPrice = 0;
    price = parseFloat(price)
    leverage = parseFloat(leverage)
    maintanceMargin = parseFloat(maintanceMargin)

    if (buyorsell == 'buy') {
        liquidationPrice = (price * leverage) / (leverage + 1 - ((maintanceMargin / 100) * leverage))
    } else if (buyorsell == 'sell') {
        liquidationPrice = (price * leverage) / (leverage - 1 + ((maintanceMargin / 100) * leverage))
    }
    return liquidationPrice;
}

export const inversePositionMargin = ({ price, quantity, leverage, takerFee, buyorsell }) => {
    try {
        price = parseFloat(price)
        quantity = parseFloat(quantity)
        leverage = parseFloat(leverage)
        takerFee = parseFloat(takerFee)

        return (
            inverseInitialMargin({ price, quantity, leverage })
            +
            inverseFeeToClose({ price, quantity, leverage, takerFee, buyorsell })
        )
    } catch (err) {
        return 0
    }
}

export const inversePositionPnL = ({ avgEntryPrice, exitPrice, quantity, side }) => {
    try {
        avgEntryPrice = parseFloat(avgEntryPrice)
        exitPrice = parseFloat(exitPrice)
        quantity = parseFloat(quantity)

        if (side == 'buy') {
            return (quantity * ((1 / avgEntryPrice) - (1 / exitPrice)))
        } else if (side == 'sell') {
            return (quantity * ((1 / exitPrice) - (1 / avgEntryPrice)))
        }
        return 0
    } catch (err) {
        return 0
    }
}