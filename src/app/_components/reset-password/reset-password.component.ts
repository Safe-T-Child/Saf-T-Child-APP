import { Component, HostListener, OnDestroy } from '@angular/core';
import { windowBreakpoint } from '../../environment';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { SafTChildProxyService } from '../../_services/saf-t-child.service.proxy';

interface TokenData {
  userId: string;
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnDestroy {
  tokenAlertMessage = '';
  isMobile: boolean = window.innerWidth < windowBreakpoint;
  token: string = '';
  tokenIsGood = false;
  userId: string = '';
  alertClass = '';
  showAlert = false;
  alertMessage = '';
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
      } else {
        this.tokenAlertMessage = 'No token';
        // this.router.navigate(['']);
      }
    });
  }

  password: FormControl<string | null> = new FormControl('', [
    Validators.required,
    this.passwordValidator,
  ]);

  confirmPassword: FormControl<string | null> = new FormControl('', [
    Validators.required,
  ]);

  formGroup = new FormGroup(
    {
      password: this.password,
      confirmPassword: this.confirmPassword,
    },
    { validators: this.confirmPasswordValidator },
  );

  ngOnDestroy(): void {
    localStorage.removeItem('temporaryToken');
  }

  checkToken() {
    try {
      const decodedToken = jwtDecode(this.token); // Decode the token
      // Check if token is expired
      const currentTime = new Date().getTime() / 1000;

      if (decodedToken.exp === null || decodedToken.exp === undefined) {
        localStorage.removeItem('temporaryToken');
        this.tokenAlertMessage = 'Invalid token'; // Token is invalid
        return;
      }

      if (decodedToken.exp > currentTime) {
        this.tokenIsGood = true;
        localStorage.setItem('temporaryToken', this.token);
        this.userId = (decodedToken as TokenData).userId;
      } else {
        localStorage.removeItem('temporaryToken');
        this.tokenAlertMessage = 'Token expired'; // Token is expired
      }
    } catch (error) {
      localStorage.removeItem('temporaryToken');
      this.tokenAlertMessage = 'Invalid token';
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth < windowBreakpoint;
  }

  resetPassword() {
    if (
      this.formGroup.valid &&
      this.tokenIsGood &&
      this.userId !== '' &&
      this.password.value === this.confirmPassword.value &&
      this.password.value
    ) {
      this.isLoading = true;
      this.safTChildProxyService
        .updateUserPassword(this.userId, this.password.value)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.alertMessage = 'Password reset successfully';
            this.alertClass = 'alert-success';
            this.showAlert = true;
            setTimeout(() => {
              this.showAlert = false;
              this.router.navigate(['login']);
            }, 3000);
          },
          error: (error) => {
            this.isLoading = false;
            this.alertMessage = 'An error occurred. Please try again';
            this.alertClass = 'alert-danger';
            this.showAlert = true;
            setTimeout(() => {
              this.showAlert = false;
            }, 3000);
          },
        }); // Send request to server to reset password
    }
    // Send request to server to reset password
  }

  passwordValidator(control: AbstractControl) {
    // Regular expression for allowed characters and minimum length of 8
    // This regex includes:
    // - At least one letter (a-zA-Z)
    // - At least one number (0-9)
    // - Special characters (!@#$%^&*()-_+=)
    // - No spaces
    // - Minimum length of 8
    const errors: { [key: string]: any } = {};

    if ((control.value && control.value.length < 8) || control.value === '') {
      errors['minLengthError'] = {
        message: 'Password must be at least 8 characters long.',
      };
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(control.value)) {
      errors['uppercaseError'] = {
        message: 'Password must contain at least one uppercase letter.',
      };
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()-_+=]/.test(control.value)) {
      errors['specialCharError'] = {
        message:
          'Password must contain at least one special character (!@#$%^&*()-_+=).',
      };
    }

    // Check for any invalid characters
    if (/[^A-Za-z\d!@#$%^&*()-_+=]/.test(control.value)) {
      errors['invalidCharError'] = {
        message: 'Password contains invalid characters.',
      };
    }

    // Return null if no errors, or an error object with details about each failing case
    return Object.keys(errors).length === 0 ? null : errors;
  }

  confirmPasswordValidator(control: AbstractControl) {
    const errors: { [key: string]: any } = {};
    const passwordvalue = control.value.password;
    const confirmPasswordvalue = control.value.confirmPassword;

    if (passwordvalue !== confirmPasswordvalue) {
      errors['passwordMatchError'] = {
        message: 'Passwords do not match.',
      };
    }

    return Object.keys(errors).length === 0 ? null : errors;
  }
}
