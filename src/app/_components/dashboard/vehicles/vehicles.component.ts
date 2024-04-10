import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VehiclesModalComponent } from '../../modals/vehicles-modal/vehicles-modal.component';
import * as SafTChildCore from '../../../_models/Saf-T-Child';
import { NamedDocumentKey } from '../../../_models/base';
import { UserAuthenticationService } from '../../../_services/user-authentication.service';
import { SafTChildProxyService } from '../../../_services/saf-t-child.service.proxy';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss',
})
export class VehiclesComponent {
  user: NamedDocumentKey = {
    id: this.userAuthenticationService.getUserId() || '',
    name: localStorage.getItem('name') || '',
  };
  vehicles: SafTChildCore.Vehicle[] = [];
  vehicle: SafTChildCore.Vehicle[] = [];
  isLoading: boolean = false;

  constructor(
    public matDialog: MatDialog,
    private safTChildProxyService: SafTChildProxyService,
    private userAuthenticationService: UserAuthenticationService,
    private router: Router,
  ) {
    this.isLoading = true;
    this.safTChildProxyService
      .getVehiclesByOwnerId(this.user.id)
      .subscribe((vehicles) => {
        this.vehicles = vehicles;
        this.isLoading = false;
      });
  }

  openDialog(): void {
    const dialogRef = this.matDialog.open(VehiclesModalComponent, {
      width: '300px',
      data: { inputData: null, title: 'Add' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.action === 'save') {
        this.reload();
      }
    });
  }

  editVehicle(vehicle: SafTChildCore.Vehicle): void {
    const dialogRef = this.matDialog.open(VehiclesModalComponent, {
      width: '300px',
      data: { inputData: vehicle, title: 'Edit' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.action === 'save') {
        this.reload();
      }
    });
  }

  reload(): void {
    this.safTChildProxyService
      .getVehiclesByOwnerId(this.user.id)
      .subscribe((vehicles) => {
        this.vehicles = vehicles;
      });
  }

  deleteVehicle(vehicle: SafTChildCore.Vehicle): void {
    this.safTChildProxyService.deleteVehicle(vehicle).subscribe({
      next: (vehicle) => {
        this.reload();
      },
      error: (e) => {
        console.log('Error occured deleting vehicle');
        console.log(e);
      },
    });
  }
}
