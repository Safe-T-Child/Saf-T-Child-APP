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
import { SafTChildProxyService } from '../../../_services/saft-t-child.service.proxy';
import { forkJoin } from 'rxjs';
import * as SafTChildCore from '../../../_models/Saf-T-Child';
import { Router } from '@angular/router';

@Component({
  selector: 'app-devices-modal',
  templateUrl: './devices-modal.component.html',
  styleUrl: './devices-modal.component.scss',
})
export class DevicesModalComponent implements OnInit, OnDestroy {
  user: NamedDocumentKey = {
    id: localStorage.getItem('userId') || '',
    name: localStorage.getItem('name') || '',
  };
  activationCode: FormControl<string | null> = new FormControl<string | null>(
    null,
    [Validators.required, Validators.maxLength(9), Validators.minLength(9)],
  );

  device: FormControl<SafTChildCore.Device | null> =
    this.fb.nonNullable.control<SafTChildCore.Device | null>(null);

  name: FormControl<string> = this.fb.nonNullable.control<string>('');

  vehicle: FormControl<SafTChildCore.Vehicle | null> =
    new FormControl<SafTChildCore.Vehicle | null>(null);

  group: FormControl<SafTChildCore.Group | null> =
    new FormControl<SafTChildCore.Group | null>(null);

  form: FormGroup = new FormGroup({
    name: this.name,
    vehicle: this.vehicle,
    group: this.group,
  });

  vehicles: Vehicle[] = [];
  groups: Group[] = [];

  get canSave(): boolean {
    if (this.name.value !== '' && this.device.value) {
      return true;
    }
    return false;
  }

  constructor(
    public dialogRef: MatDialogRef<DevicesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private modalGuardService: ModalGuardService,
    private saftTChildProxyService: SafTChildProxyService,
    private router: Router,
    private matDialog: MatDialog,
  ) {
    forkJoin([
      this.saftTChildProxyService.getGroupsByOwnerId(this.user.id),
      this.saftTChildProxyService.getVehiclesByOwnerId(this.user.id),
    ]).subscribe(([groups, vehicles]) => {
      this.groups = groups;
      this.vehicles = vehicles;

      if (groups.length === 0) {
        this.group.disable();
      }
      if (vehicles.length === 0) {
        this.vehicle.disable();
      }
    });

    this.activationCode.valueChanges.subscribe((value) => {
      const valueString = value?.toString();
      if (valueString && valueString.length === 9) {
        this.saftTChildProxyService
          .getDeviceByActivationCode(valueString)
          .subscribe((device) => {
            this.device.setValue(device);
          });
      } else {
        this.device.setValue(null);
      }
    });
  }

  saveFormState(): void {
    localStorage.setItem('formState', JSON.stringify(this.form.value));
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

  restoreFormState(): void {
    const savedFormState = JSON.parse(
      localStorage.getItem('formState') || '{}',
    );
    if (!_.isEmpty(savedFormState)) {
      this.form.patchValue(savedFormState);
      this.form.markAsDirty();
    }
  }

  clearDataFromLocalstorage(): void {
    localStorage.removeItem('formState');
  }

  ngOnInit(): void {
    window.addEventListener(
      'beforeunload',
      this.preventUnsavedChanges.bind(this),
    );
  }

  ngOnDestroy(): void {
    window.removeEventListener(
      'beforeunload',
      this.preventUnsavedChanges.bind(this),
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  preventUnsavedChanges(event: BeforeUnloadEvent): void {
    if (this.form.dirty) {
      event.returnValue = true; // Chrome requires returnValue to be set
    }
  }

  onSave(): void {
    if (this.form.valid && this.device.value) {
      const device = this.device.value;
      device.name = this.name.value;
      device.owner = this.user;

      // TODO: change model from car to vehicle
      if (this.vehicle.value) {
        device.car = {
          name: this.vehicle.value.name,
          id: this.vehicle.value.id || '',
        };
      }
      if (this.group.value) {
        device.group = {
          name: this.group.value.name,
          id: this.group.value.id || '',
        };
      }

      this.saftTChildProxyService.updateDevice(device).subscribe({
        next: (updatedDevice) => {
          this.clearDataFromLocalstorage();
          this.dialogRef.close({
            action: 'save',
            data: updatedDevice,
          });
        },
        error: (error) => {
          console.error('Error updating device', error);
        },
      });
    }
  }

  onClose(): void {
    if (this.modalGuardService.canDeactivate(this.form)) {
      this.clearDataFromLocalstorage();
      this.dialogRef.close({
        action: 'close',
        data: null, // Or any other data you wish to return
      });
    }
  }
}
