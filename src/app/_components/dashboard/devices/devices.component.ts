import { Component, HostListener, OnInit } from '@angular/core';
import { windowBreakpoint } from '../../../environment';
import { MatDialog } from '@angular/material/dialog';
import { SafTChildProxyService } from '../../../_services/saf-t-child.service.proxy';
import { VehiclesModalComponent } from '../../modals/vehicles-modal/vehicles-modal.component';
import { DevicesModalComponent } from '../../modals/devices-modal/devices-modal.component';
import { UserAuthenticationService } from '../../../_services/user-authentication.service';
import * as SafTChildCore from '../../../_models/Saf-T-Child';
import { NamedDocumentKey } from '../../../_models/base';
import { ActivatedRoute } from '@angular/router';
import _ from 'lodash';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.scss',
  providers: [SafTChildProxyService],
})
export class DevicesComponent {
  user: NamedDocumentKey = {
    id: this.userAuthenticationService.getUserId() || '',
    name: localStorage.getItem('name') || '',
  };
  devices: SafTChildCore.Device[] = [];
  isLoading: boolean = false;
  activationCode: string | null = null;
  vehicles: SafTChildCore.Vehicle[] = [];

  constructor(
    public matDialog: MatDialog,
    private safTChildProxyService: SafTChildProxyService,
    private userAuthenticationService: UserAuthenticationService,
    private route: ActivatedRoute,
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params['activationCode']) {
        this.activationCode = params['activationCode'];
        this.openDialog();
      }
    });

    this.safTChildProxyService
      .getVehiclesByOwnerId(this.user.id)
      .subscribe((vehicles) => {
        this.vehicles = vehicles;
      });

    this.isLoading = true;
    this.safTChildProxyService
      .getDevicesByOwnerId(this.user.id)
      .subscribe((devices) => {
        this.devices = devices;
        this.isLoading = false;
      });
  }

  openDialog(): void {
    const dialogRef = this.matDialog.open(DevicesModalComponent, {
      width: '250px',
      data: { activationCode: this.activationCode },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.reload();
    });
  }

  changeVehicle(target: any, device: SafTChildCore.Device) {
    const vehicleId = target.value;

    const vehicle = _.find(this.vehicles, (v) => v.id === vehicleId);

    if (!vehicle || !vehicle.id) {
      return;
    }

    device.car = {
      id: vehicle.id,
      name: vehicle.name,
    };

    this.isLoading = true;
    this.safTChildProxyService.updateDevice(device).subscribe(() => {
      this.reload();
      this.isLoading = false;
    });
  }

  reload(): void {
    this.isLoading = true;
    this.safTChildProxyService
      .getDevicesByOwnerId(this.user.id)
      .subscribe((devices) => {
        this.devices = devices;
        this.isLoading = false;
      });
  }
}
