var mqtt = require('mqtt');
const MQTT_URI = 'mqtt://localhost:1883'
const testTopic = "silabs/aoa/angle/ble-pd-842E1431C72F";
const topicFormat = "silabs/aoa/angle/"

var mqttClient = mqtt.connect(MQTT_URI) //no options

mqttClient.on("error", ()=>{
    console.log('error')
})

var testObj = {
     "x": 1.2,
     "y": 1.5,
     "z": 1.7
}

setInterval(()=>{
    mqttClient.publish(testTopic, JSON.stringify(testObj), {}, ()=>{
        console.log('sent.')
    })
}, 2000)