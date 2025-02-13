// import package
import axios from 'axios'
import fs from 'fs'
import nacl from 'tweetnacl'
import CryptoJS from 'crypto-js'
import { createHash } from '../lib/crypto'

// import model
import {
    User
} from '../models'

export const createUser = async (req, res) => {
    try {
        res.send('success')
        for (let i = 0; i < 2000; i++) {
            var randomstring = Math.random().toString(36).slice(-8);
            // console.log("-----i", i)
            let reqData = {
                'email': `${randomstring}@yopmail.com`,
                'password': "Test@123",
                'confirmPassword': 'Test@123',
                'referalcode': '',
                'langCode': 'en',
                'reCaptcha': '',
                'isTerms': 'true',
            }


            let respData = await axios({
                'url': 'http://192.168.29.63:2053/api/register',
                'method': 'post',
                data: reqData
            })
        }


    } catch (err) {
    }
}

export const getJWTToken = async (rea, res) => {
    let userData = await User.find()
    let arr = [];
    for (let item of userData) {
        let payloadData = {
            "_id": item._id
        }
        let token = new User().generateJWT(payloadData);
        arr.push('"' + token + '"')
    }

    // var log_file = "log/common_log_" + ".txt";
    // fs.appendFileSync(log_file, arr);

    fs.writeFileSync("programming.txt", arr);

}



import { generateKeyPairSync } from 'crypto'


/* ****************************************************CRYPTO********************************************* */

const crypto = require("crypto");

let privateKey1 = 'BAFbS5rPu12kdkiHe8cpqe0JQxdg9LZsPpui+CoiF1WVKraOhfA019M5GeXM3ch9LGu/EVtIJA4U2TpF8fTfKuhQpQEyCv9Pow+mHVJR7ae5mLvhbREm4XOMAlE8/QbmXHadyrfjuJstdE8xfsyJk4OwwZFK9FgodPtrN2AE4QKrPX2rsg==';
let privateKey2 = 'AwCE7CY9RzMSrGD1EIeE0JKkTW+XsScSEAZiRx53hX78UzO4Xzh1IFqAdMCe/3r/ZSmoUXyCXFaOD7hDGAdta+0gfg==';

let payload = {
    'test': 1,
};

if (payload.constructor === Object) {
    payload = JSON.stringify(payload);
}

if (payload.constructor !== Buffer) {
    payload = Buffer.from(payload, 'utf8');
}

const signature = crypto.createHash('sha256');
signature.update(payload);
signature.update(new Buffer.from(privateKey1, 'utf8'));


const signature1 = crypto.createHash('sha256');
signature1.update(payload);
signature1.update(new Buffer.from(privateKey2, 'utf8'));

const secret = 'abcdefg';
const hash = crypto.createHmac('sha256', secret)
    .update('I love cupcakes')
    .digest('hex');

const createHmacString = (privateKey, ts) => {
    const key = CryptoJS.enc.Utf8.parse(privateKey)
    const timestamp = CryptoJS.enc.Utf8.parse(ts)
    const hmac = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(timestamp, key))
    return hmac;
}

let ts = new Date().getTime();
let signature2 = createHmacString("your-private-key", ts);


export const v1GenerateSign = (payload = '') => {

    const qs = require(`querystring`);
    const paramString = qs.stringify(payload).replace(/%20/g, `+`);
    const calcHmac = crypto
        .createHmac(`sha512`, 'testing')
        .update(paramString)
        .digest(`hex`);


}


let payloadData = { "address": "TNfZYzjcsvC1hrTNtTqwosoponAcHvScXA", "amount": "2.00000000", "amounti": "200000000", "confirms": "4", "currency": "TRX", "deposit_id": "CDFKIF3KY5UHK2YF2I3MFLIH7O", "fiat_amount": "0.20662340", "fiat_amounti": "20662340", "fiat_coin": "USD", "ipn_id": "de4b65f7a05b4463e8f10fe204250a67", "ipn_mode": "hmac", "ipn_type": "deposit", "ipn_version": "1.0", "label": "GM-TEST_TRX", "merchant": "c5079ace09de33613f7ca7aab790a658", "status": "0", "status_text": "Deposit seen on network, but not confirmed", "txn_id": "133122a5f57a79220b72c6d189b8f15045c673e5520baed04a1fb14ce6140821" }



let header = { "host": "3.142.137.131:2053", "user-agent": "CoinPayments.net IPN Generator", "accept": "*/*", "hmac": "c572ed00f242e714d947d6b832aba699efbc6002fc0c80f1c7859b356636989613479a738f61a211992d00baa6c860edfad7e151cad383f530d596077f7629b7", "content-type": "application/x-www-form-urlencoded; charset=utf-8", "content-length": "484" }