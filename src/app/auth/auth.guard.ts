import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserAuthenticationService } from '../_services/user-authentication.service'; // Update the path accordingly

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private userAuthenticationService: UserAuthenticationService,
    private router: Router,
  ) {}

  canActivate(): boolean | Observable<boolean> | Promise<boolean> {
    const isAuthenticated =
      this.userAuthenticationService.checkInitialAuthState;
    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }
    if (isAuthenticated) {
      this.router.navigate(['/create-account']);
    }
    return true;
  }
}
