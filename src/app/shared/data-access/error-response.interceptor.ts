import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { removeToken } from '../../user/data-access/local-storage';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
/* import { Store } from '../../store/store'; */

export const ErrorResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
 /*  const store = inject(Store) */

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => handleErrorResponse(error, router))
  );
};

function handleErrorResponse(error: HttpErrorResponse, router: Router) {
  console.log(error.error)
  const type = error.error.type
  if (type == 'EXPIRED_TOKEN' || type == "MISSING_TOKEN" || type == "INVALID_TOKEN" ) {
    removeToken();
    window.location.reload();

    return throwError(() => error.error.message);
  }

  return throwError(() => error);
}
