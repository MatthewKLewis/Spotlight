import { Component, OnInit } from '@angular/core';
import { DMX, SpotlightService } from './spotlight.service';

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
var OFFSET_CONFIG = '0'

@Component({
  selector: 'app-eulers',
  templateUrl: './eulers.component.html',
  styleUrls: ['./eulers.component.scss']
})
export class EulersComponent implements OnInit {

  dmxPacket: DMX = {
    x: 0,
    y: 0,
    lum: 50,
    color: COLOR_YELLOW,
    strobe: 0,
    gobo: 30,
  }

  constructor(public spotLightService: SpotlightService) { }

  ngOnInit(): void {  }

  canvasClick(evt: any) {
    console.log(evt.pageX - evt.originalTarget.offsetLeft, evt.pageY - evt.originalTarget.offsetTop)
    this.dmxPacket.x = (evt.pageX - evt.originalTarget.offsetLeft);
    this.dmxPacket.y = (evt.pageY - evt.originalTarget.offsetTop);
    this.moveSpotlight()
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
