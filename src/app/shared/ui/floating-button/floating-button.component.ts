import { Component, OnInit } from '@angular/core';
import {  RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter} from 'rxjs';

@Component({
  selector: 'app-floating-button',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './floating-button.component.html',
  styles: ``,
})
export default class FloatingButtonComponent{
  constructor(private route: Router) {
   
  }


}
