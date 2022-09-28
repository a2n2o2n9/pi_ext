var StellarSdk = require("stellar-sdk");
var StellarBase = require('stellar-base');
const bip39 = require('bip39');
const ed25519 = require('@hawkingnetwork/ed25519-hd-key-rn');
var server = new StellarSdk.Server("https://api.testnet.minepi.com");

const getKeyPairFromPassphrase = async function (passphrase) {
    const seed = await bip39.mnemonicToSeed(passphrase)
    const derivedSeed = ed25519.derivePath("m/44'/314159'/0'", seed)
    return StellarSdk.Keypair.fromRawEd25519Seed(derivedSeed.key)
}

const tran =  (a, b) => {
    a = b;
    console.log(b.secret());
}

var pair1 = StellarSdk.Keypair.random();
const pub1 = "GDFV5ZGS3SIRRSO4GBR2ZYUNDNDD2SEW2W3KZQ25Q3DMJW5LS7JGYT26";
const pass_phrase = "toddler april island swift term any trick garage evolve farm health electric heavy quote business nut soap road slogan anger undo orchard valve drastic";

const pub2 = "GDDQ6F3CL4JV76FFJLOHICMFPLFSCI2BT7W4KWGK5DQ2MMEDR7MIRRDD";

getKeyPairFromPassphrase(pass_phrase)
    .then((res) => tran(pair1, res)
    )
var pri1 = pair1.secret();

// var sourceKeys = StellarSdk.Keypair.fromSecret(pri1);
var destinationId = pub2;
// Transaction will hold a built transaction we can resubmit if the result is unknown.
var transaction;
// First, check to make sure that the destination account exists.
// You could skip this, but if the account does not exist, you will be charged
// the transaction fee when the transaction fails.
server
    .loadAccount(destinationId)
    // If the account is not found, surface a nicer error message for logging.
    .catch(function (error) {
        if (error instanceof StellarSdk.NotFoundError) {
            throw new Error("The destination account does not exist!");
        } else return error;
    })
    // If there was no error, load up-to-date information on your account.
    .then(function () {
        return server.loadAccount(pub1);
    })
    .then(function (sourceAccount) {
        // Start building the transaction.
        transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET,
        })
            .addOperation(
                StellarSdk.Operation.payment({
                    destination: destinationId,
                    // Because Stellar allows transaction in many currencies, you must
                    // specify the asset type. The special "native" asset represents Lumens.
                    asset: StellarSdk.Asset.native(),
                    amount: "1",
                }),
            )
            // A memo allows you to add your own metadata to a transaction. It's
            // optional and does not affect how Stellar treats the transaction.
            .addMemo(StellarSdk.Memo.text("Test Transaction"))
            // Wait a maximum of three minutes for the transaction
            .setTimeout(180)
            .build();
        // Sign the transaction to prove you are actually the person sending it.
        transaction.sign(pair1);
        // And finally, send it off to Stellar!
        return server.submitTransaction(transaction);
    })
    .then(function (result) {
        console.log("Success! Results:", result);
    })
    .catch(function (error) {
        console.error("Something went wrong!", error);
        // If the result is unknown (no response body, timeout etc.) we simply resubmit
        // already built transaction:
        // server.submitTransaction(transaction);
    });