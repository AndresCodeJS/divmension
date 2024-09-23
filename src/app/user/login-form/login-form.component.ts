import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  Renderer2,
} from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CheckedIconComponent } from "../utils/checked-icon/checked-icon.component";
import { UsersService } from '../data-access/users.service';
import { HttpErrorResponse } from '@angular/common/http';
import { setToken } from '../data-access/local-storage';
import { Store } from '../../store/store';


@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login-form.component.html',
  styles: ``,
  providers: [UsersService]
})
export class LoginFormComponent {
   // Logica usada para al hacer click fuera de  de este formulario se cierre la ventana --------------------------
   constructor(private renderer: Renderer2, private el: ElementRef) {
    // Listener global para clicks fuera del componente
    this.renderer.listen('document', 'click', (event: Event) => {
      this.onDocumentClick(event);
    });
  }

  @Output() closeFormEventEmitter = new EventEmitter<true>();

  @Input() closeLoginForm = true;

  onDocumentClick(event: Event) {
    const clickedInside = this.el.nativeElement.contains(event.target);
    if (!clickedInside) {
      if(!this.closeLoginForm){
        this.form.reset()
        this.errors.password = false
        this.errors.username = false
        this.closeFormEventEmitter.emit(true);
      }
    }
  }

  // Abrir formulario de registro -------------------------------------------

  @Output() openSignUpFormEventEmitter = new EventEmitter<boolean>()

  openSignUpForm(){

    this.form.reset()
    this.errors.password = false
    this.errors.username = false
    this.openSignUpFormEventEmitter.emit(true)
    this.closeFormEventEmitter.emit(true);
  }

  // -----------------------------------------------------------------------------

  fb = inject(NonNullableFormBuilder);
  form = this.fb.group(
    {
      username: this.fb.control('', {
        validators: [
          Validators.required,
        ],
      }),
      password: this.fb.control('', {
        validators: [
          Validators.required,
        ],
      }),
    }
  );

  //Registro de errores cuando el usuario o password son incorrectos ------------------------------
  errors = {
    username:false,
    password: false
  }

  onKeyDown() {
    this.errors.username = false;
    this.errors.password = false;
  }

  //-----------------------------------------------------------------------------------------------

  get username() {
    return this.form.get('username') as FormControl;
  }

  get password() {
    return this.form.get('password') as FormControl;
  }

  //Se envian credenciales al backend para ser verificadas y obtener los datos de usuario

  private usersService = inject(UsersService);

  //Inyeccion del store
  store = inject(Store)

  isLoading = false

  onSubmit() {
    if (!this.form.invalid && !this.errors.username &&  !this.errors.password) {

      this.isLoading = true

      this.usersService.setLoginUser(this.form.getRawValue()).subscribe({
        next:(response)=>{
          this.form.reset()

          this.isLoading = false
          
          console.log(response);

          if (response.jwt) {
            setToken(response.jwt);
          }

          console.log('se va a guardar', response.user)

          this.store.setUser(response.user)

          window.location.reload();

          this.closeFormEventEmitter.emit(true);
        },error: (error: HttpErrorResponse) => {
          if (error.error.type == 'INVALID_USERNAME') {
            console.log(error.error.message);
            this.errors.username = true;
          }

          if (error.error.type == 'INVALID_PASSWORD') {
            console.log(error.error.message);
            this.errors.password = true;
          }

          this.isLoading = false
        },
      })
    }
  }

}
