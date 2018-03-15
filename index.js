const remote = require('electron').remote
const main = remote.require("./main.js")

main.deviceList()