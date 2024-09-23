import { Component, inject, Input } from '@angular/core';

@Component({
  selector: 'app-like-heart',
  standalone: true,
  imports: [],
  templateUrl: './like-heart.component.html',
  styles: ``
})
export class LikeHeartComponent {

  @Input() color:string = ''
  @Input() size:string = ''
  @Input() isFilled:boolean = false

}
