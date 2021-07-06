//import dependencies
const DMXDevice = require('enttec-open-dmx-usb').EnttecOpenDMXUSBDevice
const express = require('express');
const cors = require('cors');
var mqtt = require('mqtt');

//set up express app
const app = express();
const port = process.env.PORT || 5000

//set up mqtt subscriber
const MQTT_URI = 'mqtt://localhost:1883'
const testTopic = "silabs/aoa/angle/ble-pd-842E1431C72F";
const topicFormat = "silabs/aoa/angle/"
var mqttClient = mqtt.connect(MQTT_URI)

//assign middleware
app.use(cors());
app.use(express.json());

//DMX Constants
const YAW_COEFF = 2.117
const PITCH_COEFF = .705

//DMX Colors
const COLOR_RED = 10
const COLOR_WHITE = 0
const COLOR_BLUE = 30
const COLOR_CYAN = 70
const COLOR_GREEN = 40
const COLOR_ORANGE = 50
const COLOR_PURPLE = 60
const COLOR_YELLOW = 20

//DMX devices and spotlight config objects
var devices = []
// are assigned into ⤵
var spotlights = []
// hard coded sample info:
spotlights.push({
    x: 0,
    y: 0,
    height: 0,
    spotlightOffset: '0',
    assignedTag: '842E1431C72F',
    device: devices[0]
})

function findSpotlightAssociatedWith(mac) {
    for (let i = 0; i < spotlights.length; i++) {
        if (mac == spotlights[i].assignedTag) {
            return spotlights[i]
        }
        if (i == spotlights.length - 1) {
            return null
        }
    }
}
function calculateYawAngle(x, y, spotlight) {
    var opposite = Math.abs(spotlight.x - x)
    var adjacent = Math.abs(spotlight.y - y)
    var arcTan = (Math.atan(opposite / adjacent) * (180 / Math.PI))
    //console.log("Yaw Angle: " + arcTan)
    return arcTan
}
function calculatePitchAngle(x, y, spotlight) {
    var opposite = Math.abs(spotlight.x - x)
    var adjacent = Math.abs(spotlight.y - y)
    var hypotenuse = Math.sqrt(Math.pow(opposite, 2) + Math.pow(adjacent, 2))
    var arcTan = (Math.atan(hypotenuse / spotlight.height) * (180 / Math.PI))
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
console.log('devices:')
console.log(devices)

//// HTTP
app.route('/api/initialize/:id').post((req, res) => {
    try {
        if (req.params.id < devices.length) {
            spotlights[req.params.id] =
            {
                x: req.body.x,
                y: req.body.y,
                height: req.body.height,
                spotlightOffset: req.body.spotlightOffset,
                assignedTag: req.body.assignedTag,
                device: devices[req.params.id]
            }
            console.log(spotlights)
            res.status(200).send({ message: "Ok." })
        }
        else {
            res.status(500).send({ message: "No device found with index = " + req.params.id + "." })
        }
    } catch {
        res.status(500).send({ message: "Initialization Failed." })
    }
});
app.route('/api/stop/:id').post((req, res) => {
    try {
        console.log('stopping #' + req.params.id)
        spotlights[req.params.id].device.stopSending()
        res.status(200).send({ message: "Ok" })
    } catch {
        res.status(500).send({ message: "Error." })
    }
});
app.listen(port, () => {
    console.log(`Listening on port ${port}.`)
});

//MQTT
mqttClient.on("connect", () => {
    console.log('connected')
})
mqttClient.on("error", () => {
    console.log('error')
})
mqttClient.subscribe(testTopic, { qos: 2 });
mqttClient.on('message', (topic, message, packet) => {

    var macAddress = topic.substring(24, 36)
    console.log('Target for MAC: ' + macAddress)
    var spotlightToMove = findSpotlightAssociatedWith(macAddress);

    if (spotlightToMove) {
        var targetCoordinates = JSON.parse(message.toString())
        console.log(targetCoordinates);

        //inputs
        var targetX = targetCoordinates.x
        var targetY = targetCoordinates.y
        var targetZ = targetCoordinates.z

        //temp vars
        var yaw = 0
        var pitch = 0
        var color = COLOR_WHITE

        if (targetY <= spotlightToMove.y && targetX > spotlightToMove.x) {
            yaw = Math.floor(calculateYawAngle(targetX, targetY, spotlightToMove) / YAW_COEFF)
            pitch = 128 - Math.floor(calculatePitchAngle(targetX, targetY, spotlightToMove) / PITCH_COEFF)
            //color = COLOR_BLUE
        } else if (targetY > spotlightToMove.y && targetX > spotlightToMove.x) {
            yaw = 43 + (43 - (Math.floor(calculateYawAngle(targetX, targetY, spotlightToMove) / YAW_COEFF)))
            pitch = 128 - Math.floor(calculatePitchAngle(targetX, targetY, spotlightToMove) / PITCH_COEFF)
            //color = COLOR_RED
        } else if (targetY <= spotlightToMove.y && targetX <= spotlightToMove.x) {
            yaw = 43 + (43 - (Math.floor(calculateYawAngle(targetX, targetY, spotlightToMove) / YAW_COEFF)))
            pitch = 128 + Math.floor(calculatePitchAngle(targetX, targetY, spotlightToMove) / PITCH_COEFF)
        } else if (targetY > spotlightToMove.y && targetX <= spotlightToMove.x) {
            yaw = Math.floor(calculateYawAngle(targetX, targetY, spotlightToMove) / YAW_COEFF)
            pitch = 128 + Math.floor(calculatePitchAngle(targetX, targetY, spotlightToMove) / PITCH_COEFF)
        }

        // 90 DEGREE OFFSET CALIBRATION
        if (spotlightToMove.spotlightOffset == '90') {
            yaw += 42
        } else if (spotlightToMove.spotlightOffset == '180') {
            yaw += 84
        } else if (spotlightToMove.spotlightOffset == '270') {
            yaw -= 42
        }

        if (spotlightToMove.device) {
            spotlightToMove.device.setChannels({
                1: yaw,
                2: 0, //yaw fine tune
                3: pitch,
                4: 0, //pitch fine tune
                5: color,
                6: 0,
                7: 0, //strobe
                8: 60, //req.body.lum
                9: 0
            }, true)
        } else {
            console.log(`Cannot find device for command : {Yaw: ${yaw}, Pitch ${pitch}, Color: ${color}}`)
        }
    }
    else {
        console.log('spotlight assigned to ' + macAddress + ' not found.')
    }
    console.log('--------------+')
})

// // USER FLOW:
// 1. ENTER SPOTLIGHT INFO - x, y, z, offset, assignedTagMAC
// 2. MQTT Connects to the topics, based on the MAC of the TAG given to each Spotlight
// // OLD:
// app.route('/api/move/:id').post((req, res) => {
//     try {
//         console.log('Command for Spotlight #' + req.params.id)

//         //inputs
//         var targetX = req.body.x
//         var targetY = req.body.y
//         var targetZ = req.body.z

//         //temp vars
//         var yaw = 0
//         var pitch = 0
//         var color = COLOR_WHITE

//         if (targetY <= spotlights[req.params.id].y && targetX > spotlights[req.params.id].x) {
//             //console.log('top right of screen')
//             yaw = Math.floor(calculateYawAngle(targetX, targetY, req.params.id) / YAW_COEFF)
//             pitch = 128 - Math.floor(calculatePitchAngle(targetX, targetY, req.params.id) / PITCH_COEFF)
//             //color = COLOR_BLUE
//         } else if (targetY > spotlights[req.params.id].y && targetX > spotlights[req.params.id].x) {
//             //console.log('bot right of screen')
//             yaw = 43 + (43 - (Math.floor(calculateYawAngle(targetX, targetY, req.params.id) / YAW_COEFF)))
//             pitch = 128 - Math.floor(calculatePitchAngle(targetX, targetY, req.params.id) / PITCH_COEFF)
//             //color = COLOR_RED
//         } else if (targetY <= spotlights[req.params.id].y && targetX <= spotlights[req.params.id].x) {
//             //console.log('top left of screen')
//             yaw = 43 + (43 - (Math.floor(calculateYawAngle(targetX, targetY, req.params.id) / YAW_COEFF)))
//             pitch = 128 + Math.floor(calculatePitchAngle(targetX, targetY, req.params.id) / PITCH_COEFF)
//         } else if (targetY > spotlights[req.params.id].y && targetX <= spotlights[req.params.id].x) {
//             //console.log('bot left of screen')
//             yaw = Math.floor(calculateYawAngle(targetX, targetY, req.params.id) / YAW_COEFF)
//             pitch = 128 + Math.floor(calculatePitchAngle(targetX, targetY, req.params.id) / PITCH_COEFF)
//         }

//         // 90 DEGREE OFFSET CALIBRATION
//         if (spotlights[req.params.id].spotlightOffset == '90') {
//             yaw += 42
//         } else if (spotlights[req.params.id].spotlightOffset == '180') {
//             yaw += 84
//         } else if (spotlights[req.params.id].spotlightOffset == '270') {
//             yaw -= 42
//         }

//         devices[req.params.id].setChannels({
//             1: yaw,
//             2: 0, //yaw fine tune
//             3: pitch,
//             4: 0, //pitch fine tune
//             5: color,
//             6: req.body.gobo,
//             7: 0, //strobe
//             8: 60, //req.body.lum
//             9: 0 || req.body.speed
//         }, true) //TEST
//         res.status(200).send({ message: "Ok" })
//     } catch {
//         res.status(500).send({ message: "Error. Spotlight may not be initialized." })
//     }
// });