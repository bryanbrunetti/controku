const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')

const roku = require('./roku.js')
const Store = require('electron-store');

const store = new Store({defaults: {device_list: {}}})

let win

app.on('ready', () => {
  win = new BrowserWindow({
    width: 235,
    height: 830,
    resizable: false,
    fullscreenable: false,
    frame: false,
    transparent: true
  })
  win.loadURL(`file://${__dirname}/index.html`)

  win.webContents.on('did-finish-load', function(event, arg) {
    roku.findDevices()
    loadDevices()
    loadChannels()
  })

  win.webContents.on("before-input-event", function(e, input) {
   let mapped_keys = ["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", "Escape", "Enter", "Backspace"]
   let ignored_keys = ["Shift", "Control", "Alt", "Meta"]
    if(ignored_keys.includes(input["key"])) {
      // console.log('should ignore input')
    } else if(mapped_keys.includes(input["key"])) {
    let key
    switch(input["key"]) {
      case 'Escape':
        key = "Back"
      case 'ArrowUp':
        key = "Up"
      case 'ArrowLeft':
        key = "Left"
      case 'ArrowRight':
        key = "Right"
      case 'ArrowDown':
        key = "Down"
      case 'Enter':
        key = "Select"
      case 'Backspace':
        key = "Backspace"
    }
    selectedRokuAddress().then((result) => {
      if(result) {
        roku.apiCall(result, input["type"].toLowerCase() + "/" + key)
      }
    })
   } else if(input["type"] == "keyUp" || input["type"] == "keyDown") {
    selectedRokuAddress().then((result) => {
      if(result) {
        roku.apiCall(result, input["type"].toLowerCase() + "/Lit_" + encodeURIComponent(input["key"]))
      }
    })
   }
  })

  // win.webContents.openDevTools()
})


function selectedRokuAddress(callback) {
  let result = win.webContents.executeJavaScript('document.getElementById("device_list").value')
  if(typeof callback === 'function') {
    callback(result)
  } else {
    return result
  }
}

function loadDevices() {
  let devices = store.get("device-list", {})
  for(var usn in devices) {
    win.webContents.send("add_device", devices[usn])
  }
}

function addDevice(device) {
  let devices = store.get("device-list", {})
  if(devices[device["usn"]] === undefined) {
    devices[device["usn"]] = {name: device["name"], location: device["location"]}
    store.set("device-list", devices)
    return true
  } else {
    return false
  }
}

function loadChannels() {
  selectedRokuAddress().then((url) => {
    let apps = roku.apiCall(url, "query/apps", function(result) {
      if(result) {
        for(let app in result["apps"]["app"]) {
          win.webContents.send("add_channel", result["apps"]["app"][app])
        }
      }
    })
  })
}

exports.updateDevice = (location) => {
  roku.apiCall(location, "query/device-info", function(details){
    if(details) {
      var details = details["device-info"]
      let device = { usn: details["udn"][0], name: details["user-device-name"], location: location }
  
      if(addDevice(device)) { win.webContents.send("add_device", device) }
    } else {
      win.webContents.send("remove_device", location)
    }
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => { app.quit() })

ipcMain.on("api-call", (event, url, command) => {
  console.log("got an api call for: ", url, command)
  roku.apiCall(url, command)
})

ipcMain.on("launch-channel", (event, id) => {
  selectedRokuAddress().then((url) => {
    roku.apiCall(url, "launch/" + id)
  })
})

ipcMain.on("reload-channels", () => { loadChannels() })