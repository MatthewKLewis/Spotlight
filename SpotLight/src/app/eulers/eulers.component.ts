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

@Component({
  selector: 'app-eulers',
  templateUrl: './eulers.component.html',
  styleUrls: ['./eulers.component.scss']
})
export class EulersComponent implements OnInit {

  cnv!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D
  image: any = new Image(400,600)
  chosenSpotlight:number = 0

  constructor(public spotLightService: SpotlightService) { }

  ngOnInit(): void {
    this.cnv = <HTMLCanvasElement>document.querySelector('#canvas')
    this.ctx = <CanvasRenderingContext2D>this.cnv.getContext('2d')

    this.image.src = '../../assets/new_tradeshow_layout.png'
    this.image.onload = () => { this.ctx.drawImage(this.image, 0, 0, 400, 600) }

    this.cnv.width = 400
    this.cnv.height = 600
  }

  canvasClick(evt: any) {
    var x = (evt.pageX - evt.originalTarget.offsetLeft);
    var y = (evt.pageY - evt.originalTarget.offsetTop);
    
    this.ctx.drawImage(this.image, 0, 0, 400, 600)
    
    this.ctx.beginPath();
    this.ctx.moveTo(200, 270);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    var xRectified = (x / evt.target.width) * 5 //ADJUST
    var yRectified = (y / evt.target.height) * 5 //

    console.log(xRectified, yRectified)

    this.spotLightService.testSpotlight(this.chosenSpotlight,
      {
        x: xRectified,
        y: yRectified,
        z: 0,
      }
    ).subscribe((res) => {
      console.log(res)
    }, (err) => {
      console.log(err)
    })
  }
}
