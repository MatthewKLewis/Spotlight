var mqtt = require('mqtt');
const MQTT_URI = 'mqtt://localhost:1883'
//const topicFormat = "silabs/aoa/angle/"
const testTopic = "silabs/aoa/angle/ble-pd-842E1431C72F";
const testTopic2 = "silabs/aoa/angle/ble-pd-842E1431C72A";

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

setInterval(()=>{
    mqttClient.publish(testTopic2, JSON.stringify(testObj), {}, ()=>{
        console.log('sent.')
    })
}, 3500)