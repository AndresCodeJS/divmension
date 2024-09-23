import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { constants, IdropDown } from '../../../global';
import { RouterLink } from '@angular/router';
import { SearchBarDropDownComponent } from '../search-bar-drop-down/search-bar-drop-down.component';
import { DropDownMenuComponent } from '../drop-down-menu/drop-down-menu.component';
import RegisterFormComponent from '../../../user/register-form/register-form.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { LoginFormComponent } from '../../../user/login-form/login-form.component';
import { Store } from '../../../store/store';
import { IUserList } from '../../interfaces/user.interface';
import { UsersService } from '../../../user/data-access/users.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    SearchBarDropDownComponent,
    DropDownMenuComponent,
    RegisterFormComponent,
    LoginFormComponent
],
  templateUrl: './header.component.html',
  styles: ``,
  providers: [UsersService],
})
export class HeaderComponent {

  //Evento abrir/cerrar formulario de registro ---------------------------------------------------------

  closeSignForm = true;

  openSignForm() {
    this.closeSignForm = false;
  }

  onClickOut() {
    this.closeSignForm = true;
  }

  //Evento abrir/cerrar formulario login ----------------------------------------------------------------

  closeLoginForm = true;

  openLoginForm() {
    this.closeLoginForm = false;
  }

  onClickOutLoginForm() {
    this.closeLoginForm = true;
  }

  // Evento recibido de DropDownMenu del header al seleccionar una de sus opciones-------------

  login = constants.LOGIN;

  signup = constants.SIGNUP;

  onClickMenu(option: string) {
    if (option == this.login) {
      this.closeLoginForm = false;
    }

    if (option == this.signup) {
      this.closeSignForm = false;
    }
  }

  //Inyeccion del store -----------------------------------------------------------------------
  store = inject(Store);

  /// ------------------------------------------------------------------------------------------

  //Evento para cerrar o abrir lista de coincidencias de barra de búsqueda --------------------

  closeSearchList = true;

  onSearchList(event: any) {
    if (event.type == 'keydown') {
      if ((event.key as string) == 'Escape') {
        // cierra lista coincidencias al presionar escape
        this.closeSearchList = true;
      } else {
        // abre lista coincidencias al tipear dentro de la barra de búsqueda
        this.closeSearchList = false;
      }
    }
  }

  //Se usa para cerrar la lista de resultados de la barra de busqueda
  //Se activa cuando se da click fuera del la lista (por medio de un evento enviado desde el componente de la lista)
  onClickSearchList(clickIn:boolean) {
    if(clickIn){
      this.searchTerm = ''
    }
    this.closeSearchList = true;
    this.notFound = false
  }

  // Método de búsqueda con debounce en barra de búsqueda -------------------------------------------------------------------
  searchTerm: string = '';

  private timeoutId: any;

  notFound = false

  isLoading = false

  private usersService = inject(UsersService);

  userList: IUserList[] = [
    {
      username: '',
      fullname: '',
      photoUrl: '',
    },
  ];

  onSearchInput() {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {

      this.userList = [
        {
          username: '',
          fullname: '',
          photoUrl: '',
        },
      ];

      this.notFound = false

      let regex = /[^\w\s.]/;

      // Elimina espacios al inicio y al final, y cuando existen 2 o mas espacios intermedios
      let cleanString = this.searchTerm
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();

      let fixedString = cleanString.trim().replace(/\s+/g, '.'); //reemplaza espacios por puntos

      //cierra la lista cuando se borra y no queda nada escrito
      if (!fixedString) {
        this.closeSearchList = true;
      } else {

        if(!regex.test(fixedString)){ //si el texto no contiene simbolos, excepto el punto

          this.isLoading = true

          this.usersService.getUserList(fixedString).subscribe({
            next: (response) => {
              if (response.users.length) {
                this.userList = response.users;
              }else{
                this.notFound = true
              }
              this.isLoading = false
            },
            error: (error) => {
              this.notFound = true
              this.isLoading = false
            },
          });
        }else{
          this.notFound = true
        }
      }
    }, 500);
  }

  //----------------------------------------------------------------------------------
}
