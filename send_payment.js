const chalk = require('chalk')
const StellarSdk = require('stellar-sdk')
var StellarBase = require('stellar-base');
const config = require('./config.json');
const CLI = require('clui');

const accountAddress = config.my_address;
const accountPassphrase = "";
const destAccountAddress = "";
const transferAsset = StellarSdk.Asset.native();
//get amount to transfer
const transferAmt = "10";
//get memo to transfer
const transferMemo = "Good Luck";

//validate
if (!StellarBase.StrKey.isValidEd25519PublicKey(destAccountAddress)) {
    console.log(chalk.red('Not a valid destination address'))
    process.exit(1);
}


//create server object
const server = new StellarSdk.Server(config.server)
var sourceKeys = StellarSdk.Keypair.fromSecret("");

const fail = (message) => {
    console.log('\n')
    console.error(chalk.red(message))
    if (message.response && message.response.data && message.response.data.extras && message.response.data.extras.result_codes && message.response.data.extras.result_codes.operations) {
        const reason = message.response.data.extras.result_codes.operations;
        switch (reason) {
            case 'op_underfunded':
                console.log(chalk.red('reason:', 'Sender account has insufficient funds'));
                break;
            default:
                console.log(chalk.red('reason:', reason))
        }
    }
    process.exit(1)
}

const success = (tn) => {
    if (tn.successful) {
        console.log(chalk.magentaBright(`\nTransaction succeeded!\nDestination: ${destAccountAddress}\nAmt: ${transferAmt}\nMemo: ${transferMemo}\nLink: ${tn._links.transaction.href}`))
    } else {
        console.log(chalk.red('\nTransaction Failed'))
    }
}

//building transaction function
const transaction = async () => {

    const keypair = sourceKeys;

    const paymentToDest = {
        destination: destAccountAddress,
        asset: transferAsset,
        amount: transferAmt,
    }
    const txOptions = {
        fee: await server.fetchBaseFee(),
        networkPassphrase: config.networkPassphrase,
    }
    const accountA = await server.loadAccount(accountAddress)
    const transaction = new StellarSdk.TransactionBuilder(accountA, txOptions)
        .addOperation(StellarSdk.Operation.payment(paymentToDest))
        .addMemo(StellarSdk.Memo.text(transferMemo))
        .setTimeout(StellarBase.TimeoutInfinite)
        .build()

    transaction.sign(keypair)

    const response = await server.submitTransaction(transaction)
    return response

}

transaction().then(success).catch(fail)