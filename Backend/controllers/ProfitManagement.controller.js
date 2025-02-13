import AdminProfit from '../models/profitManagement'


import {
    paginationQuery,
    filterSearchQuery
} from '../lib/adminHelpers'


export const AdminProfitDisplay = async (req, res) => {
    try {
        let pagination = paginationQuery(req.query);
        let Export = req.query.export
        const header = ["CreatedAt", "UserId", "Coin", "Type", "Fee"]
        let filter = filterSearchQuery(req.query, ['coin', 'type', 'userId']);
        let count = await AdminProfit.countDocuments(filter);
        if (Export == 'csv' || Export == 'xls') {
            const exportData = await AdminProfit.find(filter)
                .sort({ "createdAt": -1 })
            let csvData = [
                header
            ]

            if (exportData && exportData.length > 0) {
                for (let item of exportData) {
                    let arr = []
                    arr.push(
                        item.createdAt,
                        item.userId,
                        item.coin,
                        item.type,
                        item.fee,
                    )
                    csvData.push(arr)
                }
            }
            return res.csv(csvData)
        } else if (Export == 'pdf') {
            const data = await AdminProfit.find(filter)
                .sort({ "createdAt": -1 })
            // .skip(pagination.skip)
            // .limit(pagination.limit)
            let result = {
                count,
                pdfData: data
            }
            return res.status(200).json({ 'success': true, 'message': 'FETCH_SUCCESS', result })
        } else {
            const data = await AdminProfit.find(filter)
                .sort({ "createdAt": -1 })
                .skip(pagination.skip)
                .limit(pagination.limit)
            let result = {
                count,
                data
            }

            return res.status(200).json({ 'success': true, 'message': 'FETCH_SUCCESS', result })
        }
    }
    catch (err) {
        return res.status(500).json({ 'success': false, 'message': "Something Wrong" })
    }
}

