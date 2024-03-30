import { Component, HostListener, OnInit } from '@angular/core';
import { windowBreakpoint } from '../../../environment';
import { MatDialog } from '@angular/material/dialog';
import { SafTChildProxyService } from '../../../_services/saf-t-child.service.proxy';
import { VehiclesModalComponent } from '../../modals/vehicles-modal/vehicles-modal.component';
import { DevicesModalComponent } from '../../modals/devices-modal/devices-modal.component';
import { UserAuthenticationService } from '../../../_services/user-authentication.service';
import * as SafTChildCore from '../../../_models/Saf-T-Child';
import { NamedDocumentKey } from '../../../_models/base';

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

  constructor(
    public matDialog: MatDialog,
    private safTChildProxyService: SafTChildProxyService,
    private userAuthenticationService: UserAuthenticationService,
  ) {
    this.safTChildProxyService
      .getDevicesByOwnerId(this.user.id)
      .subscribe((devices) => {
        this.devices = devices;
      });
  }

  openDialog(): void {
    const dialogRef = this.matDialog.open(DevicesModalComponent, {
      width: '250px',
      data: { inputData: 'your data' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.safTChildProxyService
        .getDevicesByOwnerId(this.user.id)
        .subscribe((devices) => {
          this.devices = devices;
        });
      console.log('The dialog was closed');
      console.log(result);
    });
  }
}
