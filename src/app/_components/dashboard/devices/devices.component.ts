import { Component, HostListener, OnInit } from '@angular/core';
import { windowBreakpoint } from '../../../../../environment';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.scss',
})
export class DevicesComponent {
  constructor(public matDialog: MatDialog) {}

  // openDialog(): void {
  //   const dialogRef = this.matDialog.open(EditModalComponent, {
  //     width: '250px',
  //     data: { inputData: 'your data' },
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     console.log('The dialog was closed');
  //     console.log(result);
  //   });
  // }
}
