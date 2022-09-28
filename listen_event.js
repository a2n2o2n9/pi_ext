// https://developers.stellar.org/api/resources/accounts/payments/
// https://github.com/stellar/new-docs/blob/master/content/api/resources/accounts/payments.mdx

var StellarSdk = require("stellar-sdk");
var server = new StellarSdk.Server("https://api.testnet.minepi.com");
const pub2 = "";

var callback = function (resp) {
  console.log(resp);
};

var es = server
  .payments()
  .forAccount(pub2)
  .cursor("now")
  .stream({ onmessage: callback });