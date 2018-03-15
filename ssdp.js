var ssdp = require('node-ssdp').Client, client = new ssdp({})

client.on('response', function inResponse(headers, code, rinfo) {
  // console.log(headers);
  if(headers["ST"] == "roku:ecp") {
    console.log("Found a ROKU! ");
    console.log(headers);
  }
})

exports.searchForDevices = () => {
  setTimeout(function() { client.search('ssdp:all')}, 5000);
  setTimeout(function () {client.stop()}, 10000);
}
