import { Component, OnInit } from '@angular/core';
import { SpotlightService } from './spotlight.service';

@Component({
  selector: 'app-eulers',
  templateUrl: './eulers.component.html',
  styleUrls: ['./eulers.component.scss']
})
export class EulersComponent implements OnInit {

  cnv!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D
  image: any = new Image(579,503)
  chosenSpotlight:number = 0
  coordinates: Array<string> = ['0','0']

  constructor(public spotLightService: SpotlightService) { }

  ngOnInit(): void {
    this.cnv = <HTMLCanvasElement>document.querySelector('#canvas')
    this.ctx = <CanvasRenderingContext2D>this.cnv.getContext('2d')
    this.image.src = '../../assets/office_layout.png'
    this.image.onload = () => { this.ctx.drawImage(this.image, 0, 0, 579, 503) }
    this.cnv.width = 579
    this.cnv.height = 503
    this.ctx.lineWidth = 14;
    this.ctx.strokeStyle = 'rgba(255, 221, 83, 0.5)';  
  }

  canvasClick(evt: any) {
    var x = (evt.pageX - evt.originalTarget.offsetLeft);
    var y = (evt.pageY - evt.originalTarget.offsetTop);
    this.ctx.drawImage(this.image, 0, 0, 579, 503)
    this.ctx.beginPath();
    this.ctx.moveTo(250, 175);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    var xRectified = (x / evt.target.width) * 5.79 //  ADJUST-
    var yRectified = (y / evt.target.height) * 5.03 // MENT
    this.coordinates = [xRectified.toFixed(2), yRectified.toFixed(2)];
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
