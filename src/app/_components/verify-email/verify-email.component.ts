import { Component, HostListener } from '@angular/core';
import { windowBreakpoint } from '../../environment';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { SafTChildProxyService } from '../../_services/saf-t-child.service.proxy';
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
  tokenIsGood: boolean = false;
  isLoading = false;

  constructor(
    private router: Router,
    private safTChildProxyService: SafTChildProxyService,
  ) {
    // Read query params
    this.router.routerState.root.queryParams.subscribe((params) => {
      if (params['token']) {
        this.token = params['token'];
        this.checkToken();
        if (this.tokenIsGood) {
          this.isLoading = true;
          this.safTChildProxyService.verifyEmail(this.token).subscribe({
            next: (response) => {
              this.isLoading = false;
              this.isEmailVerified = true;
            },
            error: (error) => {
              this.isLoading = false;
              this.alertMessage = error.error.message;
            },
          });
        }
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
        this.tokenIsGood = true;
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
