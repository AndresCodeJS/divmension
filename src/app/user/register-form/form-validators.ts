import {
    AbstractControl,
    FormControl,
    NonNullableFormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators,
  } from '@angular/forms';


//Valida que haya un simbolo en el password
export const hasSymbolValidator = (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      let pattern = /\W/g;
  
      if (control.value.match(pattern)) {
        return null;
      } else {
        return {
          hasNotSymbol:
            'Must contain a symbol ( @ ? ! # )',
        };
      }
    };
  };
  
  //Valida que haya un numero en el password
  export const hasDigitValidator = (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      let pattern = /\d+/g;
  
      if (control.value.match(pattern)) {
        return null;
      } else {
        return { hasNotNumber: 'Password must contain at least one number' };
      }
    };
  };
  
  //Valida la confirmación del password
  
  export const ConfirmPasswordValidator = (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      let password = control.get('password')?.value;
      let confirmPassword = control.get('repassword')?.value;
  
      if (password == confirmPassword) {
        return null;
      } else {
        return {
          diferentPassword: 'Password and Confirm Password must be the same',
        };
      }
    };
  };
  
  //Valida que no haya un simbolo en el username o en el name exceptuando los espacios
  export const hasNotSymbolValidator = (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      let pattern = /[^\w\s]/g;
  
      if (control.value.match(pattern)) {
        return { hasSymbol: 'Error' };
      } else {
        return null;
      }
    };
  };

    //Valida que no haya un numero en el nombre completo
    export const hasNotDigitValidator = (): ValidatorFn => {
        return (control: AbstractControl): ValidationErrors | null => {
          let pattern = /\d+/g;
      
          if (control.value.match(pattern)) {
            return { hasNumber: "Fullname can't contain numbers" };
          } else {
            return null
          }
        };
      };

  //Valida que no haya un espacio
  export const hasNotSpace = (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      let pattern = /\s/g
  
      if (control.value.match(pattern)) {
        return { hasSpace: "Error" };
      } else {
        return null
      }
    };
  };