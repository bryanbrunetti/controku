const {ipcRenderer} = require('electron')

ipcRenderer.on("add_device", (event, device) => {
  let option = document.createElement('option')
  option.value = device["location"]
  option.innerHTML = device["name"]
  document.getElementById("device_list").appendChild(option)
  document.getElementById("overlay").style.display = 'none'
})

ipcRenderer.on("remove_device", (event, details) => {
  document.querySelector('div.selector option[value='+ details +']').remove()
})

ipcRenderer.on("add_channel", (event, channel) => {
  let channel_anchor = document.createElement("a")
  let channel_icon = document.createElement("img")

  channel_anchor.href = "#"
  channel_anchor.addEventListener("click", function() { clickChannel(channel["attributes"]["id"]) })
  channel_anchor.dataset.id = channel["attributes"]["id"]

  channel_icon.src = selectedRokuAddress() + "query/icon/" + channel["attributes"]["id"]
  channel_icon.id = "channel-" + channel["attributes"]["id"]
  channel_icon.dataset.id = channel["attributes"]["id"]
  channel_anchor.appendChild(channel_icon)
  document.getElementById("channel-list").appendChild(channel_anchor)
})

function keyPress(key) {
  let url = selectedRokuAddress()
  console.log("pressed key, calling api-call with: ", url + key)
  ipcRenderer.send("api-call", url, "keypress/" + key)
}

function selectedRokuAddress() {
  return document.getElementById('device_list').value
}

document.querySelectorAll('#buttons area').forEach(function(button) {
  button.addEventListener("click", function(event) {
    keyPress(event.target.alt)
  })
})

document.getElementById("device_list").addEventListener("change", function(event, item) {
  let selectbox = document.getElementById("channel-list").innerHTML = ''
  ipcRenderer.send("reload-channels")
})

function clickChannel(id) { ipcRenderer.send("launch-channel", id) }