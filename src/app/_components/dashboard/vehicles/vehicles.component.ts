import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VehiclesModalComponent } from '../../modals/vehicles-modal/vehicles-modal.component';
@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss',
})
export class VehiclesComponent implements OnInit {
  constructor(public matDialog: MatDialog) {}

  ngOnInit(): void {
    this.openDialog();
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
}
