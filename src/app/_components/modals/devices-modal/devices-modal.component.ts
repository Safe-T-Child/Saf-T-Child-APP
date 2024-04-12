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

@Component({
  selector: 'app-devices-modal',
  templateUrl: './devices-modal.component.html',
  styleUrl: './devices-modal.component.scss',
})
export class DevicesModalComponent implements OnInit, OnDestroy {
  deviceEditId: string | null = null;
  isLoading = false;
  user: NamedDocumentKey = {
    id: this.userAuthenticationService.getUserId() || '',
    name: this.userAuthenticationService.getFirstName() || '',
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
  });

  vehicles: Vehicle[] = [];

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
    private userAuthenticationService: UserAuthenticationService,
    private router: Router,
    private matDialog: MatDialog,
  ) {
    this.populateActivationCode();

    this.populateEditData();

    this.saftTChildProxyService.getVehiclesByOwnerId(this.user.id).subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles;
      },
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

  populateActivationCode(): void {
    if (this.data && this.data.activationCode) {
      const activationCode = this.data.activationCode;

      if (activationCode && activationCode.length === 9) {
        this.activationCode.setValue(this.data.activationCode);
        this.saftTChildProxyService
          .getDeviceByActivationCode(activationCode)
          .subscribe((device) => {
            this.device.setValue(device);
          });
      } else {
        this.device.setValue(null);
      }
    }
  }

  populateEditData(): void {
    if (this.data && this.data.inputData) {
      const device = this.data.inputData;
      this.device.setValue(device);
      this.deviceEditId = device.id;
      this.name.setValue(device.name);

      if (device.car) {
        this.saftTChildProxyService
          .getVehiclesByOwnerId(this.user.id)
          .subscribe({
            next: (vehicles) => {
              this.vehicles = vehicles;
              const vehicle = _.find(vehicles, (v) => v.id === device.car.id);
              if (vehicle) {
                this.vehicle.setValue(vehicle);
              }
            },
          });
      }
    }
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

      if (this.isLoading) return;

      this.isLoading = true;

      if (this.deviceEditId) {
        this.saftTChildProxyService.updateDevice(device).subscribe({
          next: (updatedDevice) => {
            this.isLoading = false;
            this.dialogRef.close({
              action: 'save',
              data: updatedDevice,
            });
          },
          error: (error) => {
            console.error('Error updating device', error);
            this.isLoading = false;
          },
        });
      } else {
        this.saftTChildProxyService.updateDevice(device).subscribe({
          next: (updatedDevice) => {
            this.isLoading = false;
            this.dialogRef.close({
              action: 'save',
              data: updatedDevice,
            });
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error updating device', error);
          },
        });
      }
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
