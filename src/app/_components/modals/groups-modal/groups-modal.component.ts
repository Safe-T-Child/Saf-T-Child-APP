import { Component, HostListener } from '@angular/core';
import { OnDestroy, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { ModalGuardService } from '../../../_services/modal-guard.service';
import * as _ from 'lodash';
import { NamedDocumentKey } from '../../../_models/base';
import { Group, Vehicle } from '../../../_models/Saf-T-Child';
import { SafTChildProxyService } from '../../../_services/saf-t-child.service.proxy';
import { forkJoin } from 'rxjs';
import * as SafTChildCore from '../../../_models/Saf-T-Child';
import { Router } from '@angular/router';
import { UserAuthenticationService } from '../../../_services/user-authentication.service';

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
  user: NamedDocumentKey = {
    id: this.userAuthenticationService.getUserId() || '',
    name: this.userAuthenticationService.getFirstName() || '',
  };

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
  email: FormControl<string> = this.fb.nonNullable.control<string>(
    '',
    Validators.required,
  );
  phoneNumber: FormControl<string> = this.fb.nonNullable.control<string>(
    '',
    Validators.required,
  );
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

  constructor(
    public dialogRef: MatDialogRef<GroupsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private modalGuardService: ModalGuardService,
    private safTChildProxyService: SafTChildProxyService,
    private userAuthenticationService: UserAuthenticationService,
  ) {
    this.safTChildProxyService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (e) => {
        console.log('error occured');
        console.log(e);
      },
    });
  }

  addNew(tab: string): void {
    if (
      confirm(
        'A new tab will be open. To save changes, return to this tab. Continue?',
      )
    ) {
      const url = `/dashboard/${tab}`;
      window.open(url, '_blank');
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  onSave() {
    // In here use the insert temp user endpoint that micah created.
    // we should display if the user has accepted or decline the invite.
    // similar to have we show the device is active or not.
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

    this.safTChildProxyService.insertTempUser(user).subscribe({
      next: (group) => {
        this.dialogRef.close({
          action: 'save',
          data: group,
        });
      },
      error: (e) => {
        console.log('error occured');
        console.log(e);
      },
    });
  }

  onClose(): void {
    if (this.modalGuardService.canDeactivate(this.form)) {
      this.dialogRef.close({
        action: 'close',
        data: null, // Or any other data you wish to return
      });
    }
  }
}
