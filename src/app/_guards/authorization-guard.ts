// src/app/auth/auth-guard.service.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserAuthenticationService } from '../_services/user-authentication.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(
    private userAuthenticationService: UserAuthenticationService,
    public router: Router,
  ) {}
  canActivate(): Observable<boolean> {
    return this.userAuthenticationService.loggedIn.pipe(
      map((isLoggedIn: boolean) => {
        if (isLoggedIn) {
          if (this.router.url === '') {
            this.router.navigate(['/dashboard/devices']);
          }
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      }),
    );
  }
}
