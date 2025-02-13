// import package
import mongoose from 'mongoose';

// import lib
import { getTimeStamp } from '../lib/dateHelper';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const SiteSettingSchema = new Schema({
    userDashboard: [{
        _id: 0,
        currencyId: {
            type: ObjectId,
        },
        colorCode: {
            type: String,
            default: "",
        }
    }],
    marketTrend: {
        type: [ObjectId],
        default: []
    },
    faqTrend: {
        type: [ObjectId],
        default: []
    },
    companyName: {
        type: String,
        default: "",
    },
    siteName: {
        type: String,
        default: "",
    },
    address: {
        type: String,
        default: "",

    },
    address1: {
        type: String,
        default: "",

    },address2: {
        type: String,
        default: "",

    },
    contactNo: {
        type: String,
        default: "",

    },
    supportMail: {
        type: String,
        default: "",

    },
    facebookLink: {
        type: String,
        default: "",

    },
    facebookIcon: {
        type: String,
        default: "",
    },
    twitterIcon: {
        type: String,
        default: "",

    },
    twitterUrl: {
        type: String,
        default: "",

    },
    linkedinIcon: {
        type: String,
        default: "",

    },
    linkedinLink: {
        type: String,
        default: "",

    },

    telegramLink: {
        type: String,
        default: "",
    },
    blogLink: {
        type: String,
        default: "",
    },
    youtubeLink: {
        type: String,
        default: "",
    },
    redditLink: {
        type: String,
        default: "",
    },
    discordlink: {
        type: String,
        default: "",
    },
    mediumlink: {
        type: String,
        default: "",
    },


    sitelogo: {
        type: String,
        default: "",

    },
    emailLogo: {
        type: String,
        default: "",

    },
    binanceDeposit: {
        startTime: {
            type: Number,
            default: getTimeStamp('startTime')
        },
        endTime: {
            type: Number,
            default: getTimeStamp('endTime')
        },
        offest: {
            type: Number,
            default: 0
        },
        limit: {
            type: Number,
            default: 500
        }
    },
    ApiLimit: {
        type: Number,
        default: 0
    },
    
})

const SiteSetting = mongoose.model('sitesetting', SiteSettingSchema, 'sitesetting');
export default SiteSetting;