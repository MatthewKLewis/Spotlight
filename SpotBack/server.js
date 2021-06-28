//import dependencies
const DMXDevice = require('enttec-open-dmx-usb').EnttecOpenDMXUSBDevice
const express = require('express');
const cors = require('cors');

//set up express app
const app = express();
const port = process.env.PORT || 5000;

//assign middleware
app.use(cors());
app.use(express.json());

//device
var device;

//DMX Constants
const YAW_COEFF = 2.117
const PITCH_COEFF = .705
const COLOR_BLUE = 30;
const COLOR_CYAN = 70;
const COLOR_GREEN = 40;
const COLOR_ORANGE = 50;
const COLOR_PURPLE = 60;
const COLOR_RED = 10;
const COLOR_WHITE = 0;
const COLOR_YELLOW = 20;


// camera variables
var cameraHeight = 460
var cameraOffset = '0'
cameraX = 315
cameraY = 495

function calculateYawAngle(x, y) {
    var opposite = Math.abs(this.cameraX - x);
    var adjacent = Math.abs(this.cameraY - y);
    var arcTan = (Math.atan(opposite / adjacent) * (180 / Math.PI));
    //console.log("Yaw Angle: " + arcTan)
    return arcTan
}

function calculatePitchAngle(x, y, z) {
    var opposite = Math.abs(this.cameraX - x);
    var adjacent = Math.abs(this.cameraY - y);
    var hypotenuse = Math.sqrt(Math.pow(opposite, 2) + Math.pow(adjacent, 2))
    var arcTan = (Math.atan(hypotenuse / z) * (180 / Math.PI));
    //console.log("Pitch Angle: " + arcTan)
    return arcTan
}

app.route('/api/init/').post((req, res) => {

    console.log(req.body)
    cameraHeight = req.body.height;
    cameraX = req.body.x;
    cameraY = req.body.y;

    try {
        DMXDevice.getFirstAvailableDevice().then((promise) => {
            device = new DMXDevice(promise);
            console.log("Initialized.")
        }).catch((err) => {
            console.log(err)
        })
        res.status(200).send({ message: "Ok" })
    } catch {
        res.status(500).send({ message: "Initialization Failed" })
    }
});

app.route('/api/move').post((req, res) => {

    console.log(req.body)
    var newX = req.body.x
    var newY = req.body.y
    var yaw = 0
    var pitch = 0

    if (newY <= cameraY && newX > cameraX) {
        //console.log('top right of screen')
        yaw = Math.floor(calculateYawAngle(newX, newY) / YAW_COEFF)
        pitch = 128 - Math.floor(calculatePitchAngle(newX, newY, cameraHeight) / PITCH_COEFF)
    } else if (newY > cameraY && newX > cameraX) {
        //console.log('bot right of screen')
        yaw = 43 + (43 - (Math.floor(calculateYawAngle(newX, newY) / YAW_COEFF)))
        pitch = 128 - Math.floor(calculatePitchAngle(newX, newY, cameraHeight) / PITCH_COEFF)
    } else if (newY <= cameraY && newX <= cameraX) {
        //console.log('top left of screen')
        yaw = 43 + (43 - (Math.floor(calculateYawAngle(newX, newY) / YAW_COEFF)))
        pitch = 128 + Math.floor(calculatePitchAngle(newX, newY, cameraHeight) / PITCH_COEFF)
    } else if (newY > cameraY && newX <= cameraX) {
        //console.log('bot left of screen')
        yaw = Math.floor(calculateYawAngle(newX, newY) / YAW_COEFF)
        pitch = 128 + Math.floor(calculatePitchAngle(newX, newY, cameraHeight) / PITCH_COEFF)
    }

    // 90 DEGREE OFFSET CALIBRATION
    if (cameraOffset == '90') {
        yaw += 42
    } else if (cameraOffset == '180') {
        yaw += 84
    } else if (cameraOffset == '270') {
        yaw -= 42
    }

    device.setChannels({
        1: yaw,
        2: 0,
        3: pitch,
        4: 0,
        5: req.body.color,
        6: req.body.gobo,
        7: 0,
        8: req.body.lum,
        9: 0 || req.body.speed
    })
    res.status(200).send({ message: "Ok" })
});

app.listen(port, () => {
    console.log(`Listening on port ${port}.`)
});