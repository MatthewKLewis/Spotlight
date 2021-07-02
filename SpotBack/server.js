//import dependencies
const DMXDevice = require('enttec-open-dmx-usb').EnttecOpenDMXUSBDevice
const express = require('express');
const cors = require('cors');
var mqtt = require('mqtt');

//set up express app
const app = express();
const port = process.env.PORT || 5000

//set up mqtt subscriber
const MQTT_URI = 'https://test.mosquitto.org:1883'
const testTopic = "test";
const topicFormat = "silabs/aoa/angle/"
var topics = []
const options={
    clientId:"mqttjs01",
    username:"steve",
    password:"password",
    clean:true};
var mqttClient = mqtt.connect(MQTT_URI, options)

//assign middleware
app.use(cors());
app.use(express.json());

//DMX Constants
const YAW_COEFF = 2.117
const PITCH_COEFF = .705

//DMX Colors
const COLOR_BLUE = 30
const COLOR_CYAN = 70
const COLOR_GREEN = 40
const COLOR_ORANGE = 50
const COLOR_PURPLE = 60
const COLOR_RED = 10
const COLOR_WHITE = 0
const COLOR_YELLOW = 20

//DMX devices and spotlight config objects
var devices = []
var spotVars = []

function calculateYawAngle(x, y, spotId) {
    var opposite = Math.abs(spotVars[spotId].x - x)
    var adjacent = Math.abs(spotVars[spotId].y - y)
    var arcTan = (Math.atan(opposite / adjacent) * (180 / Math.PI))
    //console.log("Yaw Angle: " + arcTan)
    return arcTan
}
function calculatePitchAngle(x, y, spotId) {
    var opposite = Math.abs(spotVars[spotId].x - x)
    var adjacent = Math.abs(spotVars[spotId].y - y)
    var hypotenuse = Math.sqrt(Math.pow(opposite, 2) + Math.pow(adjacent, 2))
    var arcTan = (Math.atan(hypotenuse / spotVars[spotId].height) * (180 / Math.PI))
    //console.log("Pitch Angle: " + arcTan)
    return arcTan
}

//// FIND SPOTLIGHTS
try {
    DMXDevice.listDevices().then((promise) => {
        promise.forEach((tag) => {
            console.log('Tag found at ' + tag)
            devices.push(new DMXDevice(tag))
        })
    }).catch((err) => {
        console.log(err)
    })
} catch {
    console.log('Device Discovery Failed.')
}

//// HTTP
app.route('/api/initialize/:id').post((req, res) => {
    try {
        spotVars[req.params.id] =
        {
            x: req.body.x,
            y: req.body.y,
            height: req.body.height,
            spotlightOffset: req.body.spotlightOffset,
            assignedTag: req.body.assignedTag
        }
        console.log(spotVars)
    } catch {
        res.status(500).send({ message: "Initialization Failed." })
    }
});
app.route('/api/subscribe').post((req, res) => {
    try {
        console.log(req.body)
        topics.push(topicFormat + req.body.locatorId + '/' + req.body.tagId)
        mqttClient.subscribe(topics[topics.length - 1], {qos:1})
    } catch {
        res.status(500).send({ message: "Tag addition Failed." })
    }
});
app.route('/api/move/:id').post((req, res) => {
    try {
        console.log('Command for Spotlight #' + req.params.id)

        //inputs
        var targetX = req.body.x
        var targetY = req.body.y
        //var targetZ = req.body.z

        //temp vars
        var yaw = 0
        var pitch = 0
        var color = COLOR_WHITE

        if (targetY <= spotVars[req.params.id].y && targetX > spotVars[req.params.id].x) {
            //console.log('top right of screen')
            yaw = Math.floor(calculateYawAngle(targetX, targetY, req.params.id) / YAW_COEFF)
            pitch = 128 - Math.floor(calculatePitchAngle(targetX, targetY, req.params.id) / PITCH_COEFF)
            //color = COLOR_BLUE
        } else if (targetY > spotVars[req.params.id].y && targetX > spotVars[req.params.id].x) {
            //console.log('bot right of screen')
            yaw = 43 + (43 - (Math.floor(calculateYawAngle(targetX, targetY, req.params.id) / YAW_COEFF)))
            pitch = 128 - Math.floor(calculatePitchAngle(targetX, targetY, req.params.id) / PITCH_COEFF)
            //color = COLOR_RED
        } else if (targetY <= spotVars[req.params.id].y && targetX <= spotVars[req.params.id].x) {
            //console.log('top left of screen')
            yaw = 43 + (43 - (Math.floor(calculateYawAngle(targetX, targetY, req.params.id) / YAW_COEFF)))
            pitch = 128 + Math.floor(calculatePitchAngle(targetX, targetY, req.params.id) / PITCH_COEFF)
        } else if (targetY > spotVars[req.params.id].y && targetX <= spotVars[req.params.id].x) {
            //console.log('bot left of screen')
            yaw = Math.floor(calculateYawAngle(targetX, targetY, req.params.id) / YAW_COEFF)
            pitch = 128 + Math.floor(calculatePitchAngle(targetX, targetY, req.params.id) / PITCH_COEFF)
        }

        // 90 DEGREE OFFSET CALIBRATION
        if (spotVars[req.params.id].spotlightOffset == '90') {
            yaw += 42
        } else if (spotVars[req.params.id].spotlightOffset == '180') {
            yaw += 84
        } else if (spotVars[req.params.id].spotlightOffset == '270') {
            yaw -= 42
        }

        devices[req.params.id].setChannels({
            1: yaw,
            2: 0, //yaw fine tune
            3: pitch,
            4: 0, //pitch fine tune
            5: color,
            6: req.body.gobo,
            7: 0, //strobe
            8: 60, //req.body.lum
            9: 0 || req.body.speed
        }, true) //TEST
        res.status(200).send({ message: "Ok" })
    } catch {
        res.status(500).send({ message: "Error. Spotlight may not be initialized." })
    }
});
app.route('/api/stop/:id').post((req, res) => {
    try {
        console.log('stopping #' + req.params.id)
        devices[req.params.id].stopSending()
        res.status(200).send({ message: "Ok" })
    } catch {
        res.status(500).send({ message: "Error." })
    }
});
app.listen(port, () => {
    console.log(`Listening on port ${port}.`)
});

/ /MQTT
mqttClient.on("connect", ()=>{
    console.log('connected')
})
mqttClient.on("error", ()=>{
    console.log('error')
})
mqttClient.subscribe(testTopic, {qos:1});

//  {
//      "x": 1.2,
//      "y": 1.5,
//      "z": 1.7
//  }
mqttClient.on('message', (topic, message, packet)=>{
    console.log("topic is "+ topic + " Date: " + Date.now());
    console.log("message is " + message.toString());
    console.log("* * * *");

    // for each spotlight config in the array, check to see if the topic
    // mac adress matches the tag specified for the spotlight to follow
    // if there is a match between MACs, forward the spotID to calculateYaw, calculatePitch, and setChannels
})