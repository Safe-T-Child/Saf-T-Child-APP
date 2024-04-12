import { Component, HostListener } from '@angular/core';
import { OnDestroy, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { NamedDocumentKey } from '../../../_models/base';
import { Group, Vehicle } from '../../../_models/Saf-T-Child';
import { SafTChildProxyService } from '../../../_services/saf-t-child.service.proxy';
import { forkJoin } from 'rxjs';
import * as SafTChildCore from '../../../_models/Saf-T-Child';
import { Router } from '@angular/router';
import { UserAuthenticationService } from '../../../_services/user-authentication.service';
import { Observable, catchError, map, of } from 'rxjs';

interface GroupsMembers {
  users: SafTChildCore.User[];
  tempUsers: SafTChildCore.User[];
}

@Component({
  selector: 'app-groups-modal',
  templateUrl: './groups-modal.component.html',
  styleUrl: './groups-modal.component.scss',
})
export class GroupsModalComponent implements OnInit, OnDestroy {
  groupId: string | null = null;
  group: SafTChildCore.Group = {} as SafTChildCore.Group;
  editing = false;
  userToEdit: SafTChildCore.User | null = null;
  user: NamedDocumentKey = {
    id: this.userAuthenticationService.getUserId() || '',
    name: this.userAuthenticationService.getFirstName() || '',
  };
  showSuccessMessage = false;
  successMessage = 'Invite sent successfully';
  isLoading = false;

  roles: SafTChildCore.Role[] = [];

  device: FormControl<SafTChildCore.Device | null> =
    this.fb.nonNullable.control<SafTChildCore.Device | null>(null);

  firstName: FormControl<string> = this.fb.nonNullable.control<string>(
    '',
    Validators.required,
  );
  lastName: FormControl<string> = this.fb.nonNullable.control<string>(
    '',
    Validators.required,
  );
  email: FormControl<string> = this.fb.nonNullable.control<string>('', [
    Validators.required,
    Validators.email,
  ]);
  phoneNumber: FormControl<number | null> = this.fb.nonNullable.control<
    number | null
  >(null, [Validators.required, this.americanPhoneNumberValidator]);
  role: FormControl<SafTChildCore.Role | null> =
    this.fb.nonNullable.control<SafTChildCore.Role | null>(
      null,
      Validators.required,
    );

  form: FormGroup = new FormGroup({
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phoneNumber: this.phoneNumber,
    role: this.role,
  });

  groupMembers: GroupsMembers = {
    users: [],
    tempUsers: [],
  };

  get canSave(): boolean {
    if (this.editing) {
      return true;
    }
    return this.form.valid;
  }

  constructor(
    public dialogRef: MatDialogRef<GroupsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private safTChildProxyService: SafTChildProxyService,
    private userAuthenticationService: UserAuthenticationService,
  ) {
    this.populateData();

    this.phoneNumber.setAsyncValidators(
      this.phoneNumberUniqueValidator.bind(this),
    );
    this.email.setAsyncValidators(this.emailUniqueValidator.bind(this));

    this.safTChildProxyService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (e) => {
        console.log('error occured getting role');
        console.log(e);
      },
    });
  }

  populateData(): void {
    if (this.data && this.data.inputData) {
      const group = this.data.inputData;
      this.groupId = group.id;
      this.group = group;

      if (this.data.userData && this.data.role) {
        this.editing = true;
        const user = this.data.userData;
        this.userToEdit = user;

        this.isLoading = true;
        this.safTChildProxyService.getRoles().subscribe({
          next: (roles) => {
            this.roles = roles;

            const role = _.find(roles, (r) => r.name === this.data.role);
            this.role.setValue(role || null);
            this.isLoading = false;
          },
          error: (e) => {
            console.log('error occured getting role');
            console.log(e);
            this.isLoading = false;
          },
        });
      }
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  sendInvite(emailInvite: boolean): void {
    if (emailInvite) {
      const email = this.email.value;
      this.isLoading = true;
      this.safTChildProxyService.getUserByEmail(email).subscribe({
        next: (user) => {
          this.isLoading = false;
          if (user && user.id && this.groupId) {
            this.isLoading = true;
            this.safTChildProxyService
              .sendGroupInviteEmail(user.id, this.groupId)
              .subscribe({
                next: (res) => {
                  this.isLoading = false;
                  this.showSuccessMessage = true;
                  setTimeout(() => {
                    this.onClose();
                  }, 3000); // 3000
                },
                error: (e) => {
                  this.isLoading = false;
                  console.log('error occured sending email');
                  console.log(e);
                },
              });
          }
        },
        error: (e) => {
          this.isLoading = false;
          console.log('error occured getting user by email');
          console.log(e);
        },
      });

      if (!email) {
        return;
      }
    } else {
      const phoneNumber = this.phoneNumber.value;

      if (!phoneNumber) {
        return;
      }
      const phoneNumberString = phoneNumber.toString();

      this.isLoading = true;
      this.safTChildProxyService
        .getUserByPhoneNumber(phoneNumberString)
        .subscribe({
          next: (user) => {
            if (user && user.id && this.groupId) {
              this.isLoading = true;
              this.safTChildProxyService
                .sendGroupInviteEmail(user.id, this.groupId)
                .subscribe({
                  next: (res) => {
                    this.isLoading = false;
                    this.showSuccessMessage = true;
                    setTimeout(() => {
                      this.onClose();
                    }, 3000); // 3000
                  },
                  error: (e) => {
                    this.isLoading = false;
                    console.log('error occured sending email');
                    console.log(e);
                  },
                });
            }
          },
          error: (e) => {
            this.isLoading = false;
            console.log('error occured getting user by phone number');
            console.log(e);
          },
        });
    }
  }

  onSave() {
    // In here use the insert temp user endpoint that micah created.
    // we should display if the user has accepted or decline the invite.
    // similar to have we show the device is active or not.
    if (this.isLoading) {
      return;
    }
    if (!this.editing) {
      const formControls = this.form.controls;

      const user: SafTChildCore.User = {
        firstName: '',
        lastName: '',
        email: '',
        primaryPhoneNumber: {
          countryCode: 1, // Hard code for now
          phoneNumberValue: 0,
        },
        isEmailVerified: false,
        secondaryPhoneNumbers: [],
      };

      user.email = formControls['email'].value;
      user.lastName = formControls['lastName'].value;
      user.firstName = formControls['firstName'].value;

      let phoneNumber = formControls['phoneNumber'].value;
      phoneNumber = _.toNumber(phoneNumber);
      user.primaryPhoneNumber.phoneNumberValue = phoneNumber;

      this.isLoading = true;

      if (this.groupId != null) {
        const insertId = this.groupId;
        this.safTChildProxyService.insertTempUser(user, insertId).subscribe({
          next: (group) => {
            this.isLoading = false;
            this.showSuccessMessage = true;
            setTimeout(() => {
              this.dialogRef.close({
                action: 'save',
                data: group,
              });
            }, 3000); // 3000
          },
          error: (e) => {
            console.log('error occured');
            console.log(e);
            this.isLoading = false;
          },
        });
      }
    } else {
      if (this.userToEdit) {
        const userId = this.userToEdit?.id;

        // Find the user directly in the array
        const userToEdit = this.group.users.find((u) => u.id === userId);

        // Check if user exists and role is provided, otherwise exit the function
        if (!userToEdit || !this.role.value?.name) {
          return;
        }

        // Update the user's role directly in the array (the userToEdit reference points to the actual array element)
        userToEdit.role = this.role.value.name;

        this.isLoading = true;

        // Update the group in the backend
        this.safTChildProxyService.updateGroup(this.group).subscribe({
          next: (group) => {
            this.isLoading = false;
            this.successMessage = 'User updated successfully';
            this.showSuccessMessage = true;
            setTimeout(() => {
              this.isLoading = false;
              this.dialogRef.close({
                action: 'save',
                data: group,
              });
            }, 3000); // 3000
          },
          error: (e) => {
            this.isLoading = false;
            console.log('error occured');
            console.log(e);
          },
        });
      }
    }
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
          // If the username exists, res should be truthy, and we return an error object.
          return res ? { phoneNumberTaken: true } : null;
        }),
        catchError(() => {
          return of(null);
        }),
      );
  }

  onClose(): void {
    this.dialogRef.close({
      action: 'close',
      data: null, // Or any other data you wish to return
    });
  }

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
}
