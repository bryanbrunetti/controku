const request = require('request')
const parseString = require('xml2js').parseString
const ssdp = require('node-ssdp').Client, client = new ssdp({})
const main = require("./main")

client.on('response', function inResponse(headers, code, rinfo) {
  if(headers["ST"] == "roku:ecp") {
    main.updateDevice(headers["LOCATION"])
  }
})

exports.apiCall = (url, command, callback) => {
  method = command.indexOf("query/") == 0 ? "get" : "post"
  console.log("going to request with ", method, url + command)
  request[method](url + command, function (error, response, body) {
  if(!error && typeof callback === 'function') {
      parseString(body, {charkey: "name", attrkey: "attributes"}, function (err, result) { callback(result) })
    }
  });
}

exports.findDevices = () => {
  setTimeout(function() { client.search('roku:ecp')}, 5000);
  setTimeout(function () {client.stop()}, 10000);
}