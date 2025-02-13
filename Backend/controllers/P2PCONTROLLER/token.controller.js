import { json } from 'body-parser';
import Web3 from 'web3'
// const erc = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"string","name":"symbol","type":"string"}],"name":"Pair","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sync","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]
//= new Web3("https://api.avax-test.network/ext/bc/C/rpc");
const web3 = new Web3('https://sepolia.etherscan.io');
import config from "../../config/index";
const PRIVATE_KEY = '32bc870fa46162a3892ad71cc9359610fc0cc6c348853fdf7eb02701c0e8bbbe';

const useWeb3 = async(rpc) =>{
    const web3 = new Web3(rpc);
    return web3;
}

const UseWallet = async (key = PRIVATE_KEY , web3) => {
    web3.eth.accounts.wallet.add(key);
    return web3;
}
// console.log('web3------', web3.eth.accounts.privateKeyToAccount(key))

export const UseAccount = async (key = PRIVATE_KEY , web3) => {
    console.log('key = PRIVATE_KEY----', key = PRIVATE_KEY, key, PRIVATE_KEY);

    const accountInfo = await web3.eth.accounts.privateKeyToAccount(key);
    console.log('accountInfo----', accountInfo);
    
    return accountInfo.address;
}

export const UseERC20 = async (Token,key = PRIVATE_KEY , ERC20_ABI , type) => {
    var web3;
    if(type == "erc20"){
         web3 = new Web3(config.ETHRPCURL)
    }
    else if(type == "bep20"){
         web3 = new Web3(config.BINANCERPCURL)
    }
    else if(type == "trc20"){
         web3 = new Web3(config.BINANCERPCURL)
    }
    const account = await UseAccount(key , web3);
    const erc20 = JSON.parse(ERC20_ABI);
    var add = web3.utils.toChecksumAddress(Token); 
    let chain = await web3.eth.getChainId();
    const contract = new web3.eth.Contract(erc20, add);
    const decimals = await contract.methods.decimals().call();
    const symbol = await contract.methods.symbol().call();
    const balance = await contract.methods.balanceOf(account).call();
    return {contract:contract,decimals:decimals,symbol:symbol,balance:balance};
}

export const createAddress = async () => {
    const result = await web3.eth.accounts.create();
    return { address: result.address, privateKey: result.privateKey, createdBlock:"" }
}

export const toFixedNumber = (x)=> {
    if (Math.abs(x) < 1.0) {
        var e = parseInt(x.toString().split('e-')[1]);
        if (e) {
            x *= Math.pow(10, e - 1);
            x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
        }
    } else {
        var e = parseInt(x.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10, e);
            x += (new Array(e + 1)).join('0');
        }
    }
    return x.toString();
  }

export const transferToAddress = async(token,amount,fromkey,to , erc , type)=>{
    try{
        var web3;
    if(type == "erc20"){
         web3 = new Web3(config.ETHRPCURL)
    }
    else if(type == "bep20"){
         web3 = new Web3(config.BINANCERPCURL)
    }
    else if(type == "trc20"){
         web3 = new Web3(config.BINANCERPCURL)
    }
    web3 =  await UseWallet(fromkey , web3);
    var add = web3.utils.toChecksumAddress(token); 
    const erc20 = JSON.parse(erc);
    const contract = new web3.eth.Contract(erc20, add);
    const tokenInfo = await UseERC20(token,fromkey , erc , type);
    const account = await UseAccount(fromkey , web3);
    const amountIndecimals = parseFloat(amount) * 10 ** parseInt(tokenInfo.decimals);
    if(parseFloat(tokenInfo.balance) < parseFloat(amountIndecimals)){ return { status: false, message: `${tokenInfo.symbol} : Insufficient balance !` } }
    let getGasPrice = await web3.eth.getGasPrice();
   

    const gas = await contract.methods.transfer(to,toFixedNumber(amountIndecimals)).estimateGas({ from: account })
    const gasfee = (getGasPrice * gas)*1.5;
    const result = await contract.methods.transfer(to,toFixedNumber(amountIndecimals)).send({from : account , gas : gas});
    return { status: true, message: `${parseFloat(amount).toFixed(3)} ${tokenInfo.symbol} transfered successfully !`, hash: result  }
    }catch(e){
        return { status: false, message: "Something went wrong !" }
    }
}

export const  Bnbtrasfer = async(fromad , toad , amount , type) => {
    var web3;
    if(type == "erc20"){
         web3 = new Web3(config.ETHRPCURL)
    }
    else if(type == "bep20"){
         web3 = new Web3(config.BINANCERPCURL)
    }
    else if(type == "trc20"){
         web3 = new Web3(config.BINANCERPCURL)
    }
    let chain = await web3.eth.getChainId()
    let txCount = await web3.eth.getTransactionCount(fromad);
    let getGasPrice = await web3.eth.getGasPrice();
    const txObject = {
        nonce: web3.utils.toHex(txCount),
        gas: 2000000,
        to: toad.toString(),
        value: amount.toString()
    };
    const signedTx = await web3.eth.accounts.signTransaction(txObject, config.OWNERPRIVATEKEY);
    var txid = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    return txid;
}

export const Estimategas = async(token,amount,fromkey,to , erc ,type)=>{
    try{
        var web3;
    if(type == "erc20"){
         web3 = new Web3(config.ETHRPCURL)
    }
    else if(type == "bep20"){
         web3 = new Web3(config.BINANCERPCURL)
    }
    else if(type == "trc20"){
         web3 = new Web3(config.BINANCERPCURL)
    }
    const tokenInfo = await UseERC20(token,fromkey , erc , type);
    const account = await UseAccount(fromkey , web3);
    const amountIndecimals = parseFloat(amount) * 10 ** parseInt(tokenInfo.decimals);
    if(parseFloat(tokenInfo.balance) < parseFloat(amountIndecimals)){ return { status: false, message: `${tokenInfo.symbol} : Insufficient balance !` } }
    const too = web3.utils.toChecksumAddress(to)
    const gasPrice = await web3.eth.getGasPrice();
    const result = await tokenInfo.contract.methods.transfer(too,toFixedNumber(amountIndecimals)).estimateGas({ from: account });
    return { status: true, message: `${parseFloat(amount).toFixed(3)} ${tokenInfo.symbol} transfered successfully !`, hash: Math.round((result*gasPrice)*1.1)  }
    }catch(e){
        return { status: false, message: "Something went wrong !" }
    }
}

export const UseDeposits =async(LAST_RECIEVED_BLOCK_NO,key = PRIVATE_KEY)=>{
    try{
    // if blocks exists more than 1000 it is advisable to pass the difference block as 1000
    const latestBlock = await web3.eth.getBlockNumber();
    const account = UseAccount(key);
    var deposits = [];
    for (let i = parseInt(LAST_RECIEVED_BLOCK_NO); i <= latestBlock; i++) {
        const block = await web3.eth.getBlock(i, true);
        if (block) {
          for (const txn of block.transactions) {
            const transactionHash = txn.hash;
            web3.eth.getTransaction(transactionHash, async(error, transaction) => {
                if (!error) {
                    const { to, from, value, input } = transaction;
                     // Check if the transaction input data contains a token transfer function call
                    if (input.startsWith('0xa9059cbb')) {
                        // This is a token transfer transaction
                        const tokenAddress = to;
                        const recipient = `0x${input.slice(34, 74)}`; // Extract the recipient's address from the input data
                        const amount = web3.utils.toBN(`0x${input.slice(74)}`).toString(); // Extract the amount in Wei and convert it to a string
                        const tokenInfo = await UseERC20(tokenAddress);
                        const tokenSymbol = tokenInfo.symbol;
                        const transactionType = from.toLowerCase() === account.toLowerCase() ? 'Send' : 'Receive';
                        deposits.push({
                            from: from,
                            to: recipient,
                            type: transactionType,
                            amount: amount,
                            symbol: tokenSymbol,
                            hash: transactionHash,
                            token: tokenAddress
                        })
                    }
                }
            })
          }
        }
        if(i == latestBlock) { return { status: true, data: deposits, lastBlock: latestBlock }}
    }
    
}catch(e){ return { status: false, data: [] } }
}

