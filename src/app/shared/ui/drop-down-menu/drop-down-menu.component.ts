import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  Renderer2,
} from '@angular/core';
import { constants } from '../../../global';
import { Store } from '../../../store/store';
import { removeToken } from '../../../user/data-access/local-storage';
import { RouterModule } from '@angular/router';
import FloatingButtonComponent from "../floating-button/floating-button.component";

@Component({
  selector: 'app-drop-down-menu',
  standalone: true,
  imports: [RouterModule, FloatingButtonComponent],
  templateUrl: './drop-down-menu.component.html',
  styles: ``,
})
export class DropDownMenuComponent {
  constructor(private renderer: Renderer2, private el: ElementRef) {
    // Listener global para clics fuera del componente
      this.renderer.listen('document', 'click', (event: Event) => {
      this.onDocumentClick(event);
    });
  }

  closeDropDownMenu = true;

  //Constantes
  login = constants.LOGIN;
  signup = constants.SIGNUP;

  //se ejecuta cuando se pulsa el icono de menu
  onClickMenu(){
    this.closeDropDownMenu = !this.closeDropDownMenu
  }

  //Se ejecuta cuando se realiza click en alguna de las opciones del menu de invitados --------------------------
  @Output() onClickMenuEmitter = new EventEmitter <string>()

  onClickMenuOptions(option: string) {

    this.closeDropDownMenu = true
    this.onClickMenuEmitter.emit(option)
  }

  //Se ejecuta cuando se realiza click en alguna de las opciones del menu de usuario --------------------------

  //Cerrar sesión (Log Out)
  onClickLogOut(){
    removeToken()
    this.store.removeUser()
    this.closeDropDownMenu = true
    window.location.reload();
  }


  //Inyeccion del store -----------------------------------------------------------------------
    store = inject(Store)

  // -------------------------------------------------------------------------------------------------

  //Se ejecuta cuando se hace click en la pagina
  onDocumentClick(event: Event) {
    //Devuelve false si el click se produce fuera de este componente
    const clickedInside = this.el.nativeElement.contains(event.target);
    if (!clickedInside) {
        this.closeDropDownMenu = true;
    }
  }
}
