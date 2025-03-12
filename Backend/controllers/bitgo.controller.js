const { BitGo } = require('bitgo');

const ACCESS_TOKEN = "v2x6e5c38b17ddcf2f1cdb545245cfa77378988bfa46755f389697b4b2c0754d501"//without ip
const ENTERPRICE_ID = "67c9458ecaef5bed16fc5d5ea8331431"
const WEBHOOK_URL = "";

const bitgo = new BitGo({
    accessToken: ACCESS_TOKEN,
    env: 'test',
    });

export const CreateAddress = async(symbol , label , phrase) => {
    try{
        const { wallet } = await bitgo.coin(symbol).wallets().generateWallet({
            label: 'murugavelrajmaticz@gmail.com',
            passphrase: 'murugavelwallet',
            enterprise: ENTERPRICE_ID
        });
        let addwebhok = await wallet.addWebhook({
            type: 'transfer',
            allToken: false,
            url: WEBHOOK_URL,
            label: 'For Transaction',
        })
        console.log("created address", addwebhok, "wallets", wallet, wallet.id());
    }
    catch(e){
        console.log("error on create wallet" , e);
    }
}