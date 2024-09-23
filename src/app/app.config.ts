import { ApplicationConfig, NgZone, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ErrorResponseInterceptor } from './shared/data-access/error-response.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([ErrorResponseInterceptor])),
    {
      provide: NgZone,
      useFactory: () => {
        return new NgZone({
          /* enableLongStackTrace:true, */
          shouldCoalesceEventChangeDetection:true,
          shouldCoalesceRunChangeDetection:true
        });
      }
    }
  ],
};
