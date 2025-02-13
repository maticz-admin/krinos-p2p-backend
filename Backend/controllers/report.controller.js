// import model
import {


    SpotTrade,
    PerpetualOrder,
    Transaction

} from '../models'

import {
    paginationQuery,
    filterSearchQuery
} from '../lib/adminHelpers';


// import package
import csv from 'csv-express';

export const spotorderHistory = async (req, res) => {
    try {
        let pagination = paginationQuery(req.query);
        let Export = req.query.export
        let filter = filterSearchQuery(req.query, ['firstCurrency', 'secondCurrency', 'orderType', 'buyorsell', 'status']);
        let header = [
            "Date",
            "user Id",
            "Base Currency",
            "Quote Currency",
            "Type",
            "Side",
            "Avarage",
            "Price",
            "Executed",
            "Amount",
            "order Status",
        ]
        let count = await SpotTrade.countDocuments(filter)
        if (Export == 'csv' || Export == 'xls') {
            let exportData = await SpotTrade.aggregate([

                { "$match": filter },
                { "$sort": { '_id': -1 } },
                // { "$skip": pagination.skip },
                // { "$limit": pagination.limit },
                {
                    "$project": {
                        "orderDate": 1,
                        "userId": 1,
                        "status": 1,
                        "firstCurrency": 1,
                        "secondCurrency": 1,
                        "orderType": 1,
                        "buyorsell": 1,
                        "averagePrice": {
                            "$reduce": {
                                'input': "$filled",
                                'initialValue': 0,
                                'in': {
                                    "$avg": { "$add": ["$$value", { "$multiply": ["$$this.price", "$$this.filledQuantity"] }] }
                                }
                            }
                        },
                        "price": 1,
                        "filledQuantity": 1,
                        "quantity": 1,
                        "orderValue": 1,
                        "conditionalType": 1,
                        "status": 1,
                    }
                }
            ])
            let csvData = [
                header
            ]

            if (exportData && exportData.length > 0) {
                for (let item of exportData) {
                    let arr = []
                    arr.push(
                        item.orderDate,
                        item.userId,
                        item.firstCurrency,
                        item.secondCurrency,
                        item.orderType,
                        item.buyorsell,
                        item.averagePrice,
                        item.price,
                        item.filledQuantity,
                        item.quantity,
                        item.status,
                    )
                    csvData.push(arr)
                }
            }
            return res.csv(csvData)
        } else if (Export == 'pdf') {
            let data = await SpotTrade.aggregate([

                // { "$match": filter },
                { "$sort": { '_id': -1 } },
                // { "$skip": pagination.skip },
                // { "$limit": pagination.limit },
                {
                    "$project": {
                        "orderDate": 1,
                        "userId": 1,
                        "status": 1,
                        "firstCurrency": 1,
                        "secondCurrency": 1,
                        "orderType": 1,
                        "buyorsell": 1,
                        "averagePrice": {
                            "$reduce": {
                                'input': "$filled",
                                'initialValue': 0,
                                'in': {
                                    "$avg": { "$add": ["$$value", { "$multiply": ["$$this.price", "$$this.filledQuantity"] }] }
                                }
                            }
                        },
                        "price": 1,
                        "filledQuantity": 1,
                        "quantity": 1,
                        "orderValue": 1,
                        "conditionalType": 1,
                        "status": 1,
                    }
                }
            ])

            let result = {
                count: count,
                pdfData: data
            }

            return res.status(200).json({ 'success': true, "messages": "success", result })

        } else {
            let data = await SpotTrade.aggregate([

                { "$match": filter },
                { "$sort": { '_id': -1 } },
                { "$skip": pagination.skip },
                { "$limit": pagination.limit },
                {
                    "$project": {
                        "orderDate": 1,
                        "userId": 1,
                        "status": 1,
                        "firstCurrency": 1,
                        "secondCurrency": 1,
                        "orderType": 1,
                        "buyorsell": 1,
                        "averagePrice": {
                            "$reduce": {
                                'input': "$filled",
                                'initialValue': 0,
                                'in': {
                                    "$avg": { "$add": ["$$value", { "$multiply": ["$$this.price", "$$this.filledQuantity"] }] }
                                }
                            }
                        },
                        "price": 1,
                        "filledQuantity": 1,
                        "quantity": 1,
                        "orderValue": 1,
                        "conditionalType": 1,
                        "status": 1,
                    }
                }
            ])

            let result = {
                count: count,
                data
            }

            return res.status(200).json({ 'success': true, "messages": "success", result })

        }

    } catch (err) {
        return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
    }
}



export const spotTradeHistory = async (req, res) => {
    try {
        let Exports = req.query.exports
        let pagination = paginationQuery(req.query);
        let filter = filterSearchQuery(req.query, ['firstCurrency', 'secondCurrency', 'buyorsell']);
        filter['status'] = { "$in": ["pending", "completed", "cancel"] }
        const header = ["Reg.Date", "firstCurrency", "buyUserId", "sellUserId", "secondCurrency", "buyorsell", "orderType", "price", "filledQuantity", "orderValue", "Fees"]
        let count = await SpotTrade.aggregate([
            { "$match": filter },
            { "$unwind": "$filled" },
        ])

        if (Exports == 'csv' || Exports == 'xls') {
            let exportData = await SpotTrade.aggregate([
                // { "$match": filter },
                { "$unwind": "$filled" },
                { "$sort": { "createdAt": -1 } },
                {
                    "$project": {
                        "buyUserId": "$filled.buyUserId",
                        "sellUserId": "$filled.sellUserId",
                        "orderType": 1,
                        "firstCurrency": 1,
                        "secondCurrency": 1,
                        "buyorsell": 1,
                        "price": "$filled.price",
                        "filledQuantity": "$filled.filledQuantity",
                        "orderValue": "$filled.orderValue",
                        "Fees": "$filled.Fees",
                        "createdAt": "$filled.createdAt",
                    }
                }
            ])
            let csvData = [
                header
            ]

            if (exportData && exportData.length > 0) {
                for (let item of exportData) {
                    let arr = [item.createdAt]
                    arr.push(
                        item.firstCurrency,
                        item.buyUserId,
                        item.sellUserId,
                        item.secondCurrency,
                        item.buyorsell,
                        item.orderType,
                        item.price,
                        item.filledQuantity,
                        item.orderValue,
                        item.Fees,
                    )
                    csvData.push(arr)
                }
            }
            return res.csv(csvData)
        } else if (Exports == 'pdf') {
            let exportData = await SpotTrade.aggregate([
                // { "$match": filter },
                { "$unwind": "$filled" },
                { "$sort": { "createdAt": -1 } },
                {
                    "$project": {
                        "buyUserId": "$filled.buyUserId",
                        "sellUserId": "$filled.sellUserId",
                        "orderType": 1,
                        "firstCurrency": 1,
                        "secondCurrency": 1,
                        "buyorsell": 1,
                        "price": "$filled.price",
                        "filledQuantity": "$filled.filledQuantity",
                        "orderValue": "$filled.orderValue",
                        "Fees": "$filled.Fees",
                        "createdAt": "$filled.createdAt",
                    }
                },
                // { "$skip": pagination.skip },
                // { "$limit": pagination.limit }
            ])


            let result = {
                count: count.length,
                // data,
                exportData
            }
            return res.status(200).json({ 'success': true, "messages": "success", result })
        } else {
            let data = await SpotTrade.aggregate([
                { "$match": filter },
                { "$unwind": "$filled" },
                { "$sort": { "createdAt": -1 } },
                {
                    "$project": {
                        "buyUserId": "$filled.buyUserId",
                        "sellUserId": "$filled.sellUserId",
                        "orderType": 1,
                        "firstCurrency": 1,
                        "secondCurrency": 1,
                        "buyorsell": 1,
                        "price": "$filled.price",
                        "filledQuantity": "$filled.filledQuantity",
                        "orderValue": "$filled.orderValue",
                        "Fees": "$filled.Fees",
                        "createdAt": "$filled.createdAt",
                    }
                },
                { "$skip": pagination.skip },
                { "$limit": pagination.limit }
            ])


            let result = {
                count: count.length,
                data,
                exportData: []
            }
            return res.status(200).json({ 'success': true, "messages": "success", result })
        }
    } catch (err) {
        return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
    }
}

export const perpetualOrderHistory = async (req, res) => {
    try {
        let pagination = paginationQuery(req.query);
        let filter = filterSearchQuery(req.query, ['firstCurrency', 'secondCurrency', 'orderType', 'buyorsell', 'status']);
        let Export = req.query.export;
        const header = [
            "Date",
            "Base Currency",
            "Quote Currency",
            "Type",
            "Side",
            "Average",
            "Price",
            "Excuted",
            "Amount",
            "Total"
            // "Fees",
        ];
        if (Export == 'csv' || Export == 'xls') {
            let exportData = await PerpetualOrder.aggregate([
                { "$match": filter },
                { "$sort": { '_id': -1 } },
                // { "$skip": pagination.skip },
                // { "$limit": pagination.limit },
                {
                    "$project": {
                        "orderDate": {
                            "$dateToString": {
                                "date": '$orderDate',
                                "format": "%Y-%m-%d %H:%M"
                            }
                        },
                        "firstCurrency": 1,
                        "secondCurrency": 1,
                        "orderType": 1,
                        "buyorsell": 1,
                        "averagePrice": {
                            "$reduce": {
                                'input': "$filled",
                                'initialValue': 0,
                                'in': {
                                    "$avg": { "$add": ["$$value", "$$this.price"] }
                                }
                            }
                        },
                        "price": 1,
                        "filledQuantity": 1,
                        "quantity": 1,
                        "orderValue": 1,
                        "conditionalType": 1,
                        "status": 1,
                    }
                }
            ])
            let csvData = [
                header
            ]
            if (exportData && exportData.length > 0) {
                for (let item of exportData) {
                    let arr = []
                    arr.push(
                        item.orderDate.toLocaleString(),
                        item.firstCurrency,
                        item.secondCurrency,
                        item.orderType,
                        item.buyorsell,
                        item.averagePrice,
                        item.price,
                        item.filledQuantity,
                        item.quantity,
                        item.orderValue,
                    )
                    csvData.push(arr)
                }
            }
            return res.csv(csvData)

        } else if (Export == 'pdf') {
            let count = await PerpetualOrder.countDocuments(filter)
            let data = await PerpetualOrder.aggregate([
                { "$match": filter },
                { "$sort": { '_id': -1 } },
                // { "$skip": pagination.skip },
                // { "$limit": pagination.limit },
                {
                    "$project": {
                        "orderDate": {
                            "$dateToString": {
                                "date": '$orderDate',
                                "format": "%Y-%m-%d %H:%M"
                            }
                        },
                        "firstCurrency": 1,
                        "secondCurrency": 1,
                        "orderType": 1,
                        "buyorsell": 1,
                        "averagePrice": {
                            "$reduce": {
                                'input': "$filled",
                                'initialValue': 0,
                                'in': {
                                    "$avg": { "$add": ["$$value", "$$this.price"] }
                                }
                            }
                        },
                        "price": 1,
                        "filledQuantity": 1,
                        "quantity": 1,
                        "orderValue": 1,
                        "conditionalType": 1,
                        "status": 1,
                    }
                }
            ])

            let result = {
                count: count,
                pdfData: data
            }
            return res.status(200).json({ 'success': true, "messages": "success", result })

        } else {
            let count = await PerpetualOrder.countDocuments(filter)
            let data = await PerpetualOrder.aggregate([

                { "$match": filter },
                { "$sort": { '_id': -1 } },
                { "$skip": pagination.skip },
                { "$limit": pagination.limit },
                {
                    "$project": {
                        "orderDate": {
                            "$dateToString": {
                                "date": '$orderDate',
                                "format": "%Y-%m-%d %H:%M"
                            }
                        },
                        "firstCurrency": 1,
                        "secondCurrency": 1,
                        "orderType": 1,
                        "buyorsell": 1,
                        "averagePrice": {
                            "$reduce": {
                                'input': "$filled",
                                'initialValue': 0,
                                'in': {
                                    "$avg": { "$add": ["$$value", "$$this.price"] }
                                }
                            }
                        },
                        "price": 1,
                        "filledQuantity": 1,
                        "quantity": 1,
                        "orderValue": 1,
                        "conditionalType": 1,
                        "status": 1,
                    }
                }
            ])

            let result = {
                count: count,
                data
            }

            return res.status(200).json({ 'success': true, "messages": "success", result })

        }
    } catch (err) {

        return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
    }
}



export const perpetualTradeHistory = async (req, res) => {
    try {
        let pagination = paginationQuery(req.query);
        let filter = filterSearchQuery(req.query, ['firstCurrency', 'secondCurrency', 'buyorsell']);
        filter['status'] = { "$in": ["pending", "completed", "cancel"] };
        let Export = req.query.export
        const header = [

            "Date",
            "Base Currency",
            "Quote Currency",
            "Side",
            "Price",
            "Excuted",
            "Total",
            "Fees",

        ];

        if (Export == 'csv' || Export == 'xls') {

            let exportData = await PerpetualOrder.aggregate([
                { "$match": filter },
                { "$unwind": "$filled" },
                { "$sort": { "createdAt": -1 } },
                {
                    "$project": {
                        "firstCurrency": 1,
                        "secondCurrency": 1,
                        "buyorsell": 1,
                        "price": "$filled.price",
                        "filledQuantity": "$filled.filledQuantity",
                        "orderValue": "$filled.orderValue",
                        "Fees": "$filled.Fees",
                        "createdAt": {
                            "$dateToString": {
                                "date": '$filled.createdAt',
                                "format": "%Y-%m-%d %H:%M"
                            }
                        },
                    }
                },
                // { "$skip": pagination.skip },
                // { "$limit": pagination.limit }

            ])
            let csvData = [
                header
            ]
            if (exportData && exportData.length > 0) {
                for (let item of exportData) {
                    let arr = []
                    arr.push(
                        item.createdAt.toLocaleString(),
                        item.firstCurrency,
                        item.secondCurrency,
                        item.buyorsell,
                        item.price,
                        item.filledQuantity,
                        item.orderValue,
                        item.Fees,
                    )
                    csvData.push(arr)
                }
            }
            return res.csv(csvData)
        }
        if (Export == 'pdf') {

            let count = await PerpetualOrder.aggregate([
                { "$match": filter },
                { "$unwind": "$filled" },
            ])

            let data = await PerpetualOrder.aggregate([
                { "$match": filter },
                { "$unwind": "$filled" },
                { "$sort": { "createdAt": -1 } },
                {
                    "$project": {
                        "firstCurrency": 1,
                        "secondCurrency": 1,
                        "buyorsell": 1,
                        "price": "$filled.price",
                        "filledQuantity": "$filled.filledQuantity",
                        "orderValue": "$filled.orderValue",
                        "Fees": "$filled.Fees",
                        "createdAt": {
                            "$dateToString": {
                                "date": '$filled.createdAt',
                                "format": "%Y-%m-%d %H:%M"
                            }
                        },
                    }
                },
                // { "$skip": pagination.skip },
                // { "$limit": pagination.limit }
            ])

            let result = {
                count: count.length,
                pdfData: data
            }
            return res.status(200).json({ 'success': true, "messages": "success", result })

        } else {
            let count = await PerpetualOrder.aggregate([
                { "$match": filter },
                { "$unwind": "$filled" },
            ])

            let data = await PerpetualOrder.aggregate([
                { "$match": filter },
                { "$unwind": "$filled" },
                { "$sort": { "createdAt": -1 } },
                {
                    "$project": {
                        "firstCurrency": 1,
                        "secondCurrency": 1,
                        "buyorsell": 1,
                        "price": "$filled.price",
                        "filledQuantity": "$filled.filledQuantity",
                        "orderValue": "$filled.orderValue",
                        "Fees": "$filled.Fees",
                        "createdAt": {
                            "$dateToString": {
                                "date": '$filled.createdAt',
                                "format": "%Y-%m-%d %H:%M"
                            }
                        },
                    }
                },
                { "$skip": pagination.skip },
                { "$limit": pagination.limit }
            ])

            let result = {
                count: count.length,
                data
            }
            return res.status(200).json({ 'success': true, "messages": "success", result })

        }
    } catch (err) {
        return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
    }
}