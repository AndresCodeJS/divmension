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
import { CheckedIconComponent } from '../utils/checked-icon/checked-icon.component';
import {
  ConfirmPasswordValidator,
  hasDigitValidator,
  hasNotDigitValidator,
  hasNotSpace,
  hasNotSymbolValidator,
  hasSymbolValidator,
} from './form-validators';
import { UsersService } from '../data-access/users.service';
import { HttpErrorResponse } from '@angular/common/http';
import { setToken } from '../data-access/local-storage';
import { Store } from '../../store/store';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CheckedIconComponent],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css',
  providers: [UsersService],
})
export default class RegisterFormComponent {
  // Logica usada para al hacer click fuera de  de este formulario se cierre la ventana --------------------------
  constructor(private renderer: Renderer2, private el: ElementRef) {
    // Listener global para clicks fuera del componente
    this.renderer.listen('document', 'click', (event: Event) => {
      this.onDocumentClick(event);
    });
  }

  @Output() closeSignUpFormEventEmitter = new EventEmitter<true>();

  @Input() closeSignForm = true;

  onDocumentClick(event: Event) {
    const clickedInside = this.el.nativeElement.contains(event.target);
    if (!clickedInside) {
      //detecta si el click fué afuera del componente

      if (!this.closeSignForm) {
        console.log('click fuera del formulario');
        console.log('el valor de closeSign es:' + this.closeSignForm);

        this.form.reset();
        this.errors.email = false;
        this.errors.email = false;
        this.closeSignUpFormEventEmitter.emit(true);
      }
    }
  }

  //Evento para abrir login Form--------------------------------------------------------------------------------------------------

  @Output() openLoginFormEventEmitter = new EventEmitter<boolean>();

  openLoginForm() {
    this.form.reset();
    this.errors.email = false;
    this.errors.email = false;
    this.closeSignUpFormEventEmitter.emit(true);
    this.openLoginFormEventEmitter.emit(true);
  }

  // -------------------------------------------------------------------------------------------------------------

  fb = inject(NonNullableFormBuilder);
  form = this.fb.group(
    {
      username: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.maxLength(10),
          Validators.minLength(4),
          hasNotSymbolValidator(),
          hasNotSpace(),
        ],
      }),
      email: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.maxLength(30),
          Validators.email,
        ],
      }),
      fullname: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.maxLength(30),
          Validators.minLength(6),
          hasNotSymbolValidator(),
          hasNotDigitValidator(),
        ],
      }),
      password: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.maxLength(20),
          Validators.minLength(8),
          hasSymbolValidator(),
          hasDigitValidator(),
          hasNotSpace(),
        ],
      }),
      repassword: this.fb.control('', { validators: [Validators.required] }),
    },
    { validators: ConfirmPasswordValidator() }
  );

  //Manejo de errores Usuario existente y Email existente --------------------------------------

  errors = {
    username: false,
    email: false,
  };

  onKeyDown() {
    this.errors.username = false;
    this.errors.email = false;
  }

  // -------------------------------------------------------------------------------------------

  get username() {
    return this.form.get('username') as FormControl;
  }

  get password() {
    return this.form.get('password') as FormControl;
  }

  get repassword() {
    return this.form.get('repassword') as FormControl;
  }

  get fullname() {
    return this.form.get('fullname') as FormControl;
  }

  get email() {
    return this.form.get('email') as FormControl;
  }
  
  private usersService = inject(UsersService);

  //Inyeccion del store
  store = inject(Store)

  isLoading = false

  onSubmit() {
    if (!this.form.invalid) {

      this.isLoading = true

      //Peticion HTTP POST para crear el usuario
      this.usersService.setSignUpUser(this.form.getRawValue()).subscribe({
        next: (response: any) => {
          this.form.reset();

          console.log(response);

          //se almacena el token de acceso en localStorage
          if (response.jwt) {
            setToken(response.jwt);
          }

          //Se guardan los datos de usuario en el estado global
          this.store.setUser(response.user)

          this.closeSignUpFormEventEmitter.emit(true);

          this.isLoading = false
        },
        error: (error: HttpErrorResponse) => {
          if (error.error.type == 'USER_EXISTS') {
            console.log(error.error.message);
            this.errors.username = true;
          }

          if (error.error.type == 'EMAIL_EXISTS') {
            console.log(error.error.message);
            this.errors.email = true;
          }

          this.isLoading = false

          console.log(error.error.message);
        },
      });
    }
  }
}
