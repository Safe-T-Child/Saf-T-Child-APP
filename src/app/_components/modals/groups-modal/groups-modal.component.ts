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

  device: FormControl<SafTChildCore.Device | null> =
    this.fb.nonNullable.control<SafTChildCore.Device | null>(null);

  firstName: FormControl<string> = this.fb.nonNullable.control<string>('');
  lastName: FormControl<string> = this.fb.nonNullable.control<string>('');
  email: FormControl<string> = this.fb.nonNullable.control<string>('');
  phoneNumber: FormControl<string> = this.fb.nonNullable.control<string>('');

  form: FormGroup = new FormGroup({
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phoneNumber: this.phoneNumber,
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
    private saftTChildProxyService: SafTChildProxyService,
    private userAuthenticationService: UserAuthenticationService,
    private router: Router,
    private matDialog: MatDialog,
  ) {}

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

  @HostListener('window:beforeunload', ['$event'])
  preventUnsavedChanges(event: BeforeUnloadEvent): void {
    if (this.form.dirty) {
      event.returnValue = true; // Chrome requires returnValue to be set
    }
  }

  onSave(): void {
    if (this.form.valid) {
      console.log(this.form.value);
    }
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
