import { Component, HostListener, Input, OnInit } from '@angular/core';
import { windowBreakpoint } from '../../environment';
import { SafTChildProxyService } from '../../_services/saf-t-child.service.proxy';
import { Router } from '@angular/router';

import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import * as _ from 'lodash';
import * as SafTChildCore from '../../_models/Saf-T-Child';
import { Observable, catchError, map, of } from 'rxjs';
import { UserAuthenticationService } from '../../_services/user-authentication.service';
import { NamedDocumentKey } from '../../_models/base';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
  providers: [SafTChildProxyService],
})
export class AccountComponent implements OnInit {
  user: NamedDocumentKey = {
    id: this.userAuthenticationService.getUserId() || '',
    name: localStorage.getItem('name') || '',
  };
  contentActive = false;
  showInvalidLogin = false;
  isLoading = false;
  isSendingVerification = false;
  verificationSentError = false;
  wrongVerificationCode = false;
  successMessage = "User added successfully. Redirecting to Login.'";
  verificationSent = false;
  codeVerified = false;
  canResend = false;
  countdown = 45;
  showSuccessMessage = false;
  oldPhoneNumberVerified = false;
  userToUpdate: SafTChildCore.User | null = null;

  verificationCode: FormControl<number | null> = new FormControl(
    null,
    Validators.required,
  );

  firstName: FormControl<string | null> = new FormControl(
    null,
    Validators.required,
  );
  lastName: FormControl<string | null> = new FormControl(
    null,
    Validators.required,
  );

  //TODO: Add phone number validation
  // Make sure it is not assigned to another account using new endpoints
  phoneNumber: FormControl<number | null> = new FormControl(null, [
    Validators.required,
    this.americanPhoneNumberValidator,
    // Custom validator
  ]);

  activationCode: FormControl<number | null> = new FormControl<number | null>(
    null,
    [Validators.required, Validators.maxLength(9), Validators.minLength(9)],
  );

  //TODO: Add email validation
  // make sure that email is good and that
  // it is not assigned to another account
  email: FormControl<string | null> = new FormControl(null, [
    Validators.required,
    Validators.email,
  ]);
  password: FormControl<string | null> = new FormControl('', [
    Validators.required,
    this.passwordValidator,
  ]);

  formGroup: FormGroup = new FormGroup({
    firstName: this.firstName,
    lastName: this.lastName,
    phoneNumber: this.phoneNumber,
  });

  device: SafTChildCore.Device | null = null;

  isMobile: boolean = window.innerWidth < windowBreakpoint; // Example breakpoint

  test: FormControl<string | null> = new FormControl(null, Validators.required);

  get validForm() {
    if (this.formGroup.valid && this.codeVerified && this.device) {
      return true;
    }
    return false;
  }

  ngOnInit() {
    this.contentActive = true;
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth < windowBreakpoint;
  }
  constructor(
    private safTChildProxyService: SafTChildProxyService,
    private userAuthenticationService: UserAuthenticationService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.safTChildProxyService.getUser(this.user.id).subscribe({
      next: (user) => {
        this.userToUpdate = user;
        this.firstName.setValue(user.firstName);
        this.lastName.setValue(user.lastName);
        this.phoneNumber.setValue(user.primaryPhoneNumber.phoneNumberValue);
      },
      error: (e) => {
        console.log(e);
      },
    });

    this.phoneNumber.setAsyncValidators(
      this.phoneNumberUniqueValidator.bind(this),
    );
    this.email.setAsyncValidators(this.emailUniqueValidator.bind(this));

    this.activationCode.valueChanges.subscribe((value) => {
      const valueString = value?.toString();

      if (valueString && valueString.length === 9) {
        this.safTChildProxyService
          .getDeviceByActivationCode(valueString)
          .subscribe((device) => {
            this.device = device;
          });
      } else {
        this.device = null;
      }
    });
    this.phoneNumber.valueChanges.subscribe((value) => {
      this.verificationSent = false;
      this.codeVerified = false;
      this.canResend = false;
      this.countdown = 45;
      this.verificationCode.reset();
    });
  }

  sendVerification() {
    const value = this.phoneNumber.value;

    if (!value) {
      return;
    }

    const phoneNumber = value.toString();
    const phoneNumberString = '+1' + phoneNumber.toString();

    this.isSendingVerification = true;

    this.safTChildProxyService
      .sendPhoneNumberVerificationCode(phoneNumberString)
      .subscribe({
        next: (res) => {
          this.verificationSent = true;
          // add 45 second timer
          this.isSendingVerification = false;
          this.canResend = false;
          this.countdown = 45;
          setTimeout(() => (this.canResend = true), 45000); // 45 seconds till resend is allowed

          // Start the countdown
          let interval = setInterval(() => {
            this.countdown--;
            if (this.countdown === 0) {
              clearInterval(interval);
            }
          }, 1000);
        },
        error: (e) => {
          this.isSendingVerification = false;
          this.showSuccessMessage = true;
          this.successMessage =
            'Error sending verification code. Please try again later.';
          this.verificationSentError = true;
          setTimeout(() => {
            this.verificationSentError = false;
            this.showSuccessMessage = false;
          }, 3000); // 3000

          this.verificationSentError = true;
          console.log(e);
        },
      });
  }

  verifyCode() {
    const value = this.verificationCode.value;
    const phoneNumberValue = this.phoneNumber.value;
    this.wrongVerificationCode = false;

    if (!value || !phoneNumberValue) {
      return;
    }

    const phoneNumber = '+1' + phoneNumberValue.toString();

    this.safTChildProxyService
      .verifyPhoneNumber(phoneNumber, value.toString())
      .subscribe({
        next: (res) => {
          if (res.status === 'approved') {
            this.codeVerified = true;
            console.log(this.codeVerified);
          } else {
            this.wrongVerificationCode = true;
          }
        },
        error: (e) => {
          console.log(e);
        },
      });
  }

  // This will only be triggered when the formgroup is ready
  // button is disabled if from group status is Invalid
  save() {
    if (!this.formGroup.valid || !this.userToUpdate) {
      return;
    }
    const formControls = this.formGroup.controls;

    this.userToUpdate.lastName = formControls['lastName'].value;
    this.userToUpdate.firstName = formControls['firstName'].value;

    if (this.codeVerified) {
      let phoneNumber = formControls['phoneNumber'].value;
      phoneNumber = _.toNumber(phoneNumber);
      this.userToUpdate.primaryPhoneNumber.phoneNumberValue = phoneNumber;
    }

    this.isLoading = true;

    this.safTChildProxyService.updateUser(this.userToUpdate).subscribe({
      next: (user) => {
        this.successMessage = 'User updated successfully.';
        this.showSuccessMessage = true;
        this.isLoading = false;
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000); // 3000
      },
      error: (e) => {
        console.log('error occured');
        console.log(e);
        this.isLoading = false;
      },
    });
  }

  // Courteney. We will have to create custom validators like this one
  // You will use the new endpoint on the API to do so.

  americanPhoneNumberValidator(control: AbstractControl) {
    const value = control.value;

    if (!value) {
      return null;
    }

    const phoneNumber = value.toString();

    if (!Number.isNaN(Number(phoneNumber)) && phoneNumber) {
      if (phoneNumber.length != 10) {
        return { invalidPhoneNumber: true };
      }
    }
    return null;
  }

  emailUniqueValidator(
    control: AbstractControl,
  ): Observable<ValidationErrors | null> {
    const email = control.value;

    // Check if the control value is empty and consider it as valid directly to avoid unnecessary API call.
    if (!email) {
      return of(null);
    }

    return this.safTChildProxyService.checkEmail(email).pipe(
      map((res) => {
        // If the username exists, res should be truthy, and we return an error object.
        if (res.isEmailTaken) {
          return { emailTaken: true };
        }
        return null;
      }),
      catchError(() => {
        return of(null);
      }),
    );
  }
  checkIfPhoneChanged() {
    return (
      this.userToUpdate?.primaryPhoneNumber.phoneNumberValue !==
      Number(this.phoneNumber.value)
    );
  }

  phoneNumberUniqueValidator(
    control: AbstractControl,
  ): Observable<ValidationErrors | null> {
    // TODO: Add country code form control
    // Hardcoded to USA country code for now
    const countryCode = 1;
    const value = control.value;

    if (!value) {
      return of(null);
    }
    const phoneNumber = value.toString();

    // Check if the control value is empty and consider it as valid directly to avoid unnecessary API call.
    if (!phoneNumber) {
      return of(null);
    }

    return this.safTChildProxyService
      .checkPhoneNumber(phoneNumber, countryCode)
      .pipe(
        map((res) => {
          if (
            this.userToUpdate?.primaryPhoneNumber.phoneNumberValue ===
            Number(phoneNumber)
          ) {
            return null;
          }
          // If the username exists, res should be truthy, and we return an error object.
          return res ? { phoneNumberTaken: true } : null;
        }),
        catchError(() => {
          return of(null);
        }),
      );
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
}
