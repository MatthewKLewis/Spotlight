import { Component, OnInit } from '@angular/core';
import { DMX, SpotlightService } from './spotlight.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

var OFFSET_CONFIG = '0'

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

//camera is at 495, 453
//total image size is 834 x 769

@Component({
  selector: 'app-eulers',
  templateUrl: './eulers.component.html',
  styleUrls: ['./eulers.component.scss']
})
export class EulersComponent implements OnInit {

  dmxPacket: DMX = {
    yaw: 0,
    pitch: 0,
    lum: 20,
    color: 0,
    strobe: 0,
    gobo: 0,
  }

  cameraX: number = 315
  cameraY: number = 495
  cameraHeight: number = 300 // roughly 30 pixels per foot of height.

  constructor(public spotLightService: SpotlightService) { }

  ngOnInit(): void {  }

  canvasClick(evt: any) {
    var newX = (evt.pageX - evt.originalTarget.offsetLeft)
    var newY = (evt.pageY - evt.originalTarget.offsetTop)
    //console.log('Distance from Camera:')
    //console.log('X: ' + newX + ' Y: ' + newY)
    console.log('ΔX: ' + (this.cameraX - newX) + ' ΔY: ' + (this.cameraY - newY))

    if (OFFSET_CONFIG == '0') {
      //do nothing
    } else if (OFFSET_CONFIG == '90') {
      var temp = newX
      newX = newY
      newY = temp
    }

    //ASSIGN YAW AND PITCH
    if (newY <= this.cameraY && newX > this.cameraX) {
      console.log('top right of screen')
      this.dmxPacket.yaw = Math.floor(this.calculateYawAngle(newX, newY) / YAW_COEFF)
      this.dmxPacket.pitch = 128 - Math.floor(this.calculatePitchAngle(newX, newY, this.cameraHeight) / PITCH_COEFF)
    } else if (newY > this.cameraY && newX > this.cameraX) {
      console.log('bot right of screen')
      this.dmxPacket.yaw = 43 + (43 - (Math.floor(this.calculateYawAngle(newX, newY) / YAW_COEFF)))
      this.dmxPacket.pitch = 128 - Math.floor(this.calculatePitchAngle(newX, newY, this.cameraHeight) / PITCH_COEFF)
    } else if (newY <= this.cameraY && newX <= this.cameraX) {
      console.log('top left of screen')
      this.dmxPacket.yaw = 43 + (43 - (Math.floor(this.calculateYawAngle(newX, newY) / YAW_COEFF)))
      this.dmxPacket.pitch = 128 + Math.floor(this.calculatePitchAngle(newX, newY, this.cameraHeight) / PITCH_COEFF)
    } else if (newY > this.cameraY && newX <= this.cameraX) {
      console.log('bot left of screen')
      this.dmxPacket.yaw = Math.floor(this.calculateYawAngle(newX, newY) / YAW_COEFF)
      this.dmxPacket.pitch = 128 + Math.floor(this.calculatePitchAngle(newX, newY, this.cameraHeight) / PITCH_COEFF) //WRONG
    } //GIMBAL UNLOCKING PRODUCES WEIRD MOVEMENT IN CROSSING Y AXIS!!

    // //FOR CALIBRATING
    //this.dmxPacket.yaw = 128;
    //this.dmxPacket.pitch = 0;

    this.moveSpotlight()
  }

  calculateYawAngle(x: number, y: number) {
    var opposite = Math.abs(this.cameraX - x);
    var adjacent = Math.abs(this.cameraY - y);
    var arcTan = (Math.atan(opposite / adjacent) * (180 / Math.PI));
    //console.log("Yaw Angle: " + arcTan)
    return arcTan
  }

  calculatePitchAngle(x: number, y: number, z: number) {
    var opposite = Math.abs(this.cameraX - x);
    var adjacent = Math.abs(this.cameraY - y);
    var hypotenuse = Math.sqrt(Math.pow(opposite, 2) + Math.pow(adjacent, 2))
    var arcTan = (Math.atan(hypotenuse / z) * (180 / Math.PI));
    console.log("Pitch Angle: " + arcTan)
    return arcTan
  }

  initSpotlight() {
    this.spotLightService.initializeSpotlight().subscribe((res) => {
      //do nothing
    }, (err) => {
      console.log(err)
    })
  }

  moveSpotlight() {
    this.spotLightService.testSpotlight(this.dmxPacket).subscribe((res) => {
      //console.log(res)
    })
  }

}
