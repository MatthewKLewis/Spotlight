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

app.route('/api/init').get((req, res) => {
    try {
        DMXDevice.getFirstAvailableDevice().then((promise) => {
            device = new DMXDevice(promise);
            console.log("Initialized.")
        }).catch((err) => {
            console.log(err)
        })
        res.status(200).send({message: "Ok"})
    } catch {
        res.status(500).send({message: "Initialization Failed"})
    }
});

app.route('/api/move').post((req, res) => {
    console.log(req.body)
    device.setChannels({
        1: req.body.yaw,
        2: 0,
        3: req.body.pitch,
        4: 0,
        5: req.body.color,
        6: req.body.gobo,
        7: 0,
        8: req.body.lum,
        9: 0 || req.body.speed
    })
    res.status(200).send({message: "Ok"})
});

app.listen(port, () => {
    console.log(`Listening on port ${port}.`)
});