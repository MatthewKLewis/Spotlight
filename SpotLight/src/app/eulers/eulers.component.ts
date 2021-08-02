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
  image: any = new Image(542,812)
  chosenSpotlight:number = 0
  coordinates: Array<string> = ['0','0']

  constructor(public spotLightService: SpotlightService) { }

  ngOnInit(): void {
    this.cnv = <HTMLCanvasElement>document.querySelector('#canvas')
    this.ctx = <CanvasRenderingContext2D>this.cnv.getContext('2d')
    this.image.src = '../../assets/booth.png'
    this.image.onload = () => { this.ctx.drawImage(this.image, 0, 0, 542, 812) }
    this.cnv.width = 542
    this.cnv.height = 812
    this.ctx.lineWidth = 14;
    this.ctx.strokeStyle = 'rgba(255, 221, 83, 0.5)';  
  }

  canvasClick(evt: any) {
    var x = (evt.pageX - evt.originalTarget.offsetLeft);
    var y = (evt.pageY - evt.originalTarget.offsetTop);

    //console.log(x, y)

    this.ctx.drawImage(this.image, 0, 0, 542, 812)
    this.ctx.beginPath();
    if (this.chosenSpotlight == 0) {
      this.ctx.moveTo(271, 313);
    } else {
      this.ctx.moveTo(271, 498);
    }
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    
    var xRectified = (x / evt.target.width) * 10 //ADJUSTMENT
    var yRectified = (y / evt.target.height) * 30
    console.log(xRectified, yRectified)
    
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
