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

  constructor(
    public matDialog: MatDialog,
    private safTChildProxyService: SafTChildProxyService,
    private userAuthenticationService: UserAuthenticationService,
    private router: Router,
  ) {
    this.safTChildProxyService
      .getVehiclesByOwnerId(this.user.id)
      .subscribe((vehicles) => {
        this.vehicles = vehicles;
      });
  }

  openDialog(): void {
    const dialogRef = this.matDialog.open(VehiclesModalComponent, {
      width: '300px',
      data: { inputData: 'your data' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      console.log(result);
    });
  }

  deleteVehicle(vehicle: SafTChildCore.Vehicle): void{
    this.safTChildProxyService.deleteVehicle(vehicle).subscribe({
      next: (vehicle) => {
        console.log('Vehicle deleted');
      },
      
      error: (e) => {
        console.log('Error occured deleting vehicle');
        console.log(e);
      },
    });
  }
}
