import { Component, HostListener } from '@angular/core';
import { windowBreakpoint } from '../../environment';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent {
  isMobile: boolean = window.innerWidth < windowBreakpoint;
  token: string = '';
  alertMessage = '';
  isEmailVerified: boolean = false;
  isTokenExpired: boolean = false;
  isTokenInvalid: boolean = false;

  constructor(private router: Router) {
    // Read query params
    this.router.routerState.root.queryParams.subscribe((params) => {
      if (params['token']) {
        this.token = params['token'];
        this.checkToken();
      } else {
        this.router.navigate(['']);
      }
    });
  }

  checkToken() {
    try {
      const decodedToken = jwtDecode(this.token); // Decode the token
      // Check if token is expired
      const currentTime = new Date().getTime() / 1000;

      if (decodedToken.exp === null || decodedToken.exp === undefined) {
        this.alertMessage = 'Invalid token'; // Token is invalid
        return;
      }

      if (decodedToken.exp > currentTime) {
        this.isEmailVerified = true; // Token is good and not expired
      } else {
        this.alertMessage = 'Token expired'; // Token is expired
      }
    } catch (error) {
      this.alertMessage = 'Invalid token';
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth < windowBreakpoint;
  }
}
