const { BitGo } = require('bitgo');

// const ACCESS_TOKEN = "v2xe4bc62ad05ee5369591bda19f1a50d06254965d63ab885e6fcabc4a86ed0163f";  //client
// const ACCESS_TOKEN = "v2x42e290fb414f996a7b6fa9d3837bc11e4009276ae75cc3ce305914d8a35fe9f4"  //client new

// const ACCESS_TOKEN = "v2x757e5a80f6b2a412b8ff2f6d77f791e025d68d9ab3f67419a9cc1e91d882c385" //ip
// const ACCESS_TOKEN = "v2x804d0259b4b2da43e6290d6aaf6049d08ddcbe2d9841f1efe5a953f30ff6ffce"//without ip
const ACCESS_TOKEN = "v2x85c52e8937e65884ac4641b0d943314d2f176abbe0b6b3b674619a7236db013e"
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
        let addwebhok = await wallet.addWebhook({
          type: 'transfer',
          allToken: false,
          url: 'https://qc3kj71m-2053.inc1.devtunnels.ms/bitgo-webhook',
          label: 'For Testing purpose',
        })
        // // const address = await wallet.createAddress();
         console.log("created address" ,addwebhok ,  "wallets" , wallet , wallet.id() , wallet);
        // Finalsendtransaction()
        Createtransactlist()
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
        const wallet = await bitgo.coin("tbtc").wallets().get({ id: "67dbaaefc9532fc37ee600f1ba71dc42" });
        let bal = await wallet.balance()
        console.log("wallet" , wallet ,bal);
        
    
        // Define the recipient address and amount to send (in satoshis)
        const recipientAddress = 'tb1pdy5gcfknrpyy2myja5csyteky2y5r9jcleyzj0lnfjv0hpnu2tas6fqg86';
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
          type : "internal"
        });
        
        
        console.log('Transaction Sent: ', transaction);
      } catch (error) {
        console.error('Error sending transaction:', error);
      }
}


export const Createtransactlist = async(symbol) => {
  try{
    const wallet = await bitgo.coin("tbtc").wallets().get({ id: "67dace8747425cbe905d49fd34b0a6bc" });
    let transferlist = await wallet.transfers();
    console.log("list of transaction" , transferlist);
    const stimulate = await wallet.simulateWebhook({
      transferId : "67dacefcac89a1eee0c9b511dcbc8d69",
      webhookId : "67dace896eb3c9360ee678f8e999b84a"
    })
    
  }
  catch(e){
      console.log("error on create wallet" , e);
  }
}