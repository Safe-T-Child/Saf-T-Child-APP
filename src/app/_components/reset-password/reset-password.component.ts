import { Component, HostListener } from '@angular/core';
import { windowBreakpoint } from '../../environment';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  alertMessage = '';
  isMobile: boolean = window.innerWidth < windowBreakpoint;
  token: string = '';

  constructor(private router: Router) {
    // Read query params
    this.router.routerState.root.queryParams.subscribe((params) => {
      if (params['token']) {
        this.token = params['token'];
        this.checkToken();
      } else {
        this.alertMessage = 'No token';
        // this.router.navigate(['']);
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

      if (decodedToken.exp < currentTime) {
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
