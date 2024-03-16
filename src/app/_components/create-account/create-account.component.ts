import { Component, HostListener, Input, OnInit } from '@angular/core';
import { windowBreakpoint } from '../../../../environment';
import { SafTChildProxyService } from '../../_services/saft-t-child.service.proxy';
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

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss',
  providers: [SafTChildProxyService],
})
export class CreateAccountComponent implements OnInit {
  contentActive = false;
  showInvalidLogin = false;
  isLoading = false;

  // TODO: Delete when pushing to prod. This comments are for educations purposes only
  // 1. All our inputs will be formControls. We declare the form control
  // as their own variables. This allows use to check for their status or their value without
  // having to refer to their formGroup. This technique is valid to be used
  // when there are no other formgroup.

  //TODO: add validation to make sure that username is not already taken
  // Add
  username: FormControl<string | null> = new FormControl(null, [
    Validators.required,
    Validators.pattern(/^\w+$/), // Only letters and numbers
  ]);

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

  //TODO: Add email validation
  // make sure that email is good and that
  // it is not assigned to another account
  email: FormControl<string | null> = new FormControl(null, [
    Validators.required,
    Validators.email,
  ]);
  password: FormControl<string | null> = new FormControl(null, [
    Validators.required,
    this.passwordValidator,
  ]);

  // TODO: DELETE TOO
  // After all our formcontrols have been created add them into one fromgroup
  // This will facilitate whenever we want to check if the form is ready to be submitted.
  // The form group will be valid ONLY when ALL the controls, that are required, have a VALID status

  formGroup: FormGroup = new FormGroup({
    username: this.username,
    password: this.password,
    firstName: this.firstName,
    lastName: this.lastName,
    phoneNumber: this.phoneNumber,
    email: this.email,
  });

  isMobile: boolean = window.innerWidth < windowBreakpoint; // Example breakpoint

  ngOnInit() {
    this.contentActive = true;
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth < windowBreakpoint;
  }
  constructor(
    private safTChildProxyService: SafTChildProxyService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.username.setAsyncValidators(this.usernameUniqueValidator.bind(this));
    this.phoneNumber.setAsyncValidators(
      this.phoneNumberUniqueValidator.bind(this),
    );
    this.email.setAsyncValidators(this.emailUniqueValidator.bind(this));
  }

  // This will only be triggered when the formgroup is ready
  // button is disabled if from group status is Invalid
  createAccount() {
    const formControls = this.formGroup.controls;

    const user: SafTChildCore.User = {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      primaryPhoneNumber: {
        countryCode: 1, // Hard code for now
        phoneNumberValue: 0,
      },
      isEmailVerified: false,
      secondaryPhoneNumbers: [],
    };

    user.email = formControls['email'].value;
    user.username = formControls['username'].value;
    user.lastName = formControls['lastName'].value;
    user.firstName = formControls['firstName'].value;

    let phoneNumber = formControls['phoneNumber'].value;
    phoneNumber = _.toNumber(phoneNumber);
    user.primaryPhoneNumber.phoneNumberValue = phoneNumber;

    user.password = formControls['password'].value;

    this.safTChildProxyService.insertNewUser(user).subscribe({
      next: (user) => {
        this.router.navigate(['/dashboard']);
      },
      error: (e) => {
        console.log('error occured');
        console.log(e);
      },
    });
  }

  // Courteney. We will have to create custom validators like this one
  // You will use the new endpoint on the API to do so.

  americanPhoneNumberValidator(control: AbstractControl) {
    const phoneNumber = control.value;
    if (!Number.isNaN(Number(phoneNumber)) && phoneNumber) {
      if (phoneNumber.length != 10) {
        return { invalidPhoneNumber: true };
      }
    }
    return null;
  }

  usernameUniqueValidator(
    control: AbstractControl,
  ): Observable<ValidationErrors | null> {
    const username = control.value;

    // Check if the control value is empty and consider it as valid directly to avoid unnecessary API call.
    if (!username) {
      return of(null);
    }

    return this.safTChildProxyService.checkUserName(username).pipe(
      map((res) => {
        // If the username exists, res should be truthy, and we return an error object.
        return res ? { usernameTaken: true } : null;
      }),
      catchError(() => {
        return of(null);
      }),
    );
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
        return res ? { emailTaken: true } : null;
      }),
      catchError(() => {
        return of(null);
      }),
    );
  }

  phoneNumberUniqueValidator(
    control: AbstractControl,
  ): Observable<ValidationErrors | null> {
    // TODO: Add country code form control
    // Hardcoded to USA country code for now
    const countryCode = 1;
    const phoneNumber = control.value;

    // Check if the control value is empty and consider it as valid directly to avoid unnecessary API call.
    if (!phoneNumber) {
      return of(null);
    }

    return this.safTChildProxyService
      .checkPhoneNumber(phoneNumber, countryCode)
      .pipe(
        map((res) => {
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
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=])[A-Za-z\d!@#$%^&*()-_+=]{8,}$/;
    const valid = regex.test(control.value);
    return valid ? null : { invalidPassword: { value: control.value } };
  }
}
