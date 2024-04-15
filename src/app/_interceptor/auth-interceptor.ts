import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    if (request.url.startsWith(environment.safTChildApiUrl)) {
      const token = localStorage.getItem('Saf-T-ChildToken');

      const tempPoraryToken = localStorage.getItem('temporaryToken');

      if (tempPoraryToken && !token) {
        const tempAuthRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${tempPoraryToken}`,
          },
        });
        return next.handle(tempAuthRequest);
      }

      if (!token) {
        return next.handle(request);
      }

      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      return next.handle(authRequest);
    }

    return next.handle(request);
  }
}
