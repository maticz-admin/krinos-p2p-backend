const { BitGo } = require('bitgo');

// const ACCESS_TOKEN = "v2xe4bc62ad05ee5369591bda19f1a50d06254965d63ab885e6fcabc4a86ed0163f";  //client
// const ACCESS_TOKEN = "v2x42e290fb414f996a7b6fa9d3837bc11e4009276ae75cc3ce305914d8a35fe9f4"  //client new

// const ACCESS_TOKEN = "v2x757e5a80f6b2a412b8ff2f6d77f791e025d68d9ab3f67419a9cc1e91d882c385" //ip
const ACCESS_TOKEN = "v2x6e5c38b17ddcf2f1cdb545245cfa77378988bfa46755f389697b4b2c0754d501"//without ip
const bitgo = new BitGo({
    accessToken: ACCESS_TOKEN,
    env: 'test',
    });

export const CreateWallet = async(symbol) => {
    try{
        const result = await bitgo.session();
        console.dir(result);
          const { wallet } = await bitgo.coin('tbtc').wallets().generateWallet({
            label: 'murugavelrajmaticz@gmail.com',
            passphrase: 'murugavelwallet',
            // enterprise: '67bf20b0cb4ae0362b9d9321ec3fcd83' //client
            enterprise : "67c9458ecaef5bed16fc5d5ea8331431"
        });
        let stimulate = await wallet.simulateWebhook
        let addwebhok = await wallet.addWebhook({
          type: 'transfer',
          allToken: false,
          url: 'https://krinosp2p-backend.maticz.in/bitgo-webhook',
          label: 'For Testing purpose',
        })
        // const address = await wallet.createAddress();
        console.log("created address" ,addwebhok ,  "wallets" , wallet , wallet.id());
        // Finalsendtransaction()
        // Createtransactlist()
    }
    catch(e){
        console.log("error on create wallet" , e);
    }
}

export const SendAmount = async () => {
    try {
        console.log("send amount 1");
        const walletInstance = await bitgo.coin("tbtc4").wallets().get({ id: "67c9757ee2f27e897886cbe97cf70f0f" });
        console.log("send amount 2" , walletInstance);
        console.log("send amount 3");
        const transaction = await walletInstance.sendMany({
            recipients: [
                {
                    amount: '100',
                    address: "tb1qkfht7nnd64d6cg578sr6qv75ksjuw6ck6nq7yn",
                }
            ],
            walletPassphrase: "murugavelwallet",
        });
        console.log("send amount 4");
        const explanation = await bitgo.coin("tbtc4").explainTransaction({ txHex: transaction.tx });
        console.log("send amount 5");
        console.log('Wallet ID:', walletInstance.id());
        console.log('Current Receive Address:', walletInstance.receiveAddress());
        console.log('New Transaction:', JSON.stringify(transaction, null, 4));
        console.log('Transaction Explanation:', JSON.stringify(explanation, null, 4));
    }
    catch (e) {
        console.log("Error on send amount", e);
    }
}
  

const keychains = {
    user: {
      pub: 'xpub661MyMwAqRbcG6QDUAtJJAYayNe6nNPX4roMQ1gCfBKY3hPA6qeb12VaKMmMowPxyQkT3v5GLjaaanNN8a2mqB5x3RSPyT7KyLEXxESmXwB',
    },
    backup: {
      pub: 'xpub661MyMwAqRbcEbZdzc87Y2pwGR4idjAs3ngaY11L7sTmLvcZs5pJ5yJVDhvbwoYsFgZiXCvDwRjgGzQExa44hgahYDbaGupNyW4PCMfYvbU',
    },
    bitgo: {
      pub: 'xpub661MyMwAqRbcFv6zPFRHH7626DcaqNkrRpfiNqk6X3fp5sDRcETrCNErpwEty5Mcrq3tFtYwXKt7yztNJ3YpZCaQvS6ZoRWb3RSaKjZHiA9',
    },
  };

  const walletPassphrase = "murugavelwallet"
  const recipients = [
    {
      amount: '0.0000001',
      address: 'tb1pcg7mmlst2tt628flqjtknrngnxa4uelvtwegmnlufzmyn5xqrpzq4vkj8d', //tb1pcg7mmlst2tt628flqjtknrngnxa4uelvtwegmnlufzmyn5xqrpzq4vkj8d
    },
  ];
export const sendanotherway = async () => {
    try {
        const basecoin = bitgo.coin("tbtc4");
        const walletInstance = await basecoin.wallets().get({ id: walletId });

        const transaction = await walletInstance.sendMany({
            recipients,
            walletPassphrase,
            verification: {
                keychains,
            },
        });

    }
    catch (e) {
        console.log("error on send another way", e);

    }
}


export const Finalsendtransaction = async() => {
    try {
        // Define the wallet ID (replace with actual wallet ID)
        const wallet = await bitgo.coin("tbtc").wallets().get({ id: "67ce6ad6ab3f0afd9d8f857ba3f5c068" });
        let bal = await wallet.balance()
        console.log("wallet" , wallet ,bal);
        
    
        // Define the recipient address and amount to send (in satoshis)
        const recipientAddress = 'tb1qkfht7nnd64d6cg578sr6qv75ksjuw6ck6nq7yn';
        const amountToSend = 10000; // Example amount in satoshis (0.0001 BTC)
    
        // Create a transaction
        // const webhook = await wallet.addWebhook
        const transaction = await wallet.sendMany({
          recipients: [
            {
              address: recipientAddress,
              amount: amountToSend,
            },
          ],
          // Optional: Set the fee rate (in satoshis per byte)
          feeRate: 1000, // Example fee rate
          // Specify the passphrase to unlock the wallet
          walletPassphrase: 'murugavelwallet',
        });
        
        
        console.log('Transaction Sent: ', transaction);
      } catch (error) {
        console.error('Error sending transaction:', error);
      }
}


export const Createtransactlist = async(symbol) => {
  try{
    const wallet = await bitgo.coin("tbtc").wallets().get({ id: "67ce8b8a092629e8eb2b10539ed5b324" });
    let transferlist = await wallet.transfers();
    console.log("list of transaction" , transferlist);
    const stimulate = await wallet.simulateWebhook({
      transferId : "67ce928745535b5ed953f2bf40b46909",
      webhookId : " "
    })
    
  }
  catch(e){
      console.log("error on create wallet" , e);
  }
}