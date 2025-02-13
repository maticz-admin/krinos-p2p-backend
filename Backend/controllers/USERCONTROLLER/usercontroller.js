import axios from "axios";
import p2pcreateOrder from "../../models/P2p-createorders";
import Orderchat from "../../models/Chat_schema";
import isEmpty from '../../lib/isEmpty';
import { decryptString, decodedata , encodedata } from '../../lib/cryptoJS';


export const paginationQuery = (query) => {
    let pagination = {
        skip: 0,
        limit: 10,
        page: 1
    };

    if (!isEmpty(query) && !isEmpty(query.page) && !isEmpty(query.limit)) {
        pagination.skip = (query.page - 1) * query.limit;
        pagination.limit = Number(query.limit);
        pagination.page = Number(query.page);
    }
    return pagination;
};

export const Getuserp2pcreateorder = async (req, res) => {
    try {
       
        let pagination = paginationQuery(req.query);
        let userId = req.query.userId;
        let buyorsell = req.query.buyorsell;

        let matchCriteria = { createrid: userId };

        if (buyorsell) {
            matchCriteria.ordertype = buyorsell;
        }

        const count = await p2pcreateOrder.countDocuments(matchCriteria);

        let result = await p2pcreateOrder.aggregate([
            { $match: matchCriteria },
            { $sort: { createdAt: -1 } }, 
            { $skip: parseInt(pagination.skip) },
            { $limit: parseInt(pagination.limit) }
        ]);

        if (result.length > 0) {
         
            await Promise.all(result.map(async (item, ind) => {
                const coin = item.preferedcurrency;
                const marketValue = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${item.coin}&tsyms=${coin}`);
                const resMarketValue = marketValue?.data[coin];
                const convertedValue = (resMarketValue / 100) * parseFloat(item.offermargin);
                const currencyValue = item.offermargin ? resMarketValue + convertedValue : item?.fixedmarketrate;
                result[ind].currencyvalue = currencyValue;
            }));

            return res.status(200).json(encodedata({
                type: "success",
                data: result,
                count: count
            }));
        } else {
            return res.status(200).json(encodedata({
                type: "success",
                data: [],
                count: count
            }));
        }

    } catch (err) {
        return res.status(500).json(encodedata({
            type: "failed",
            message: "Error found"
        }));
    }
};



export const Getuserp2pviewoffer = async (req, res) => {
    try {
        // console.log('count-----', req.query)
// console.log('suygdfuyguyfgusfgusdigiusdhdgudfudg--------------------------')
        // return false
        let pagination = paginationQuery(req.query);
        let userId = req?.query?.userId;
        
        // Use .countDocuments() instead of .count()
        let count = await Orderchat.find({ ordercreator: userId }).countDocuments(); 

        let result = [];

        result = await Orderchat.aggregate([{ $match: { ordercreator: userId } }])
            .sort({ createdAt: -1 })
            .skip(parseInt(pagination.skip))
            .limit(parseInt(pagination.limit));


        if (result.length > 0) {  // Use result.length instead of checking result != ''

            return res.status(200).json(encodedata({
                type: "success",
                data: result,
                count: count
            }));
        } 
        else {
            return res.status(200).json(encodedata({
                type: "success",
                data: [],
                count: 0
            }));
        }
    }
    catch (e) {
        // console.log('ee--------------', e);
        return res.status(500).json(encodedata({
            type: "failed",
            message: "Error found"
        }));
    }
}
