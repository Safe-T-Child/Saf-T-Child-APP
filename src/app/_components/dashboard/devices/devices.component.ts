import { Component, HostListener, OnInit } from '@angular/core';
import { windowBreakpoint } from '../../../../../environment';
import { MatDialog } from '@angular/material/dialog';
import { SafTChildProxyService } from '../../../_services/saft-t-child.service.proxy';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.scss',
  providers: [SafTChildProxyService],
})
export class DevicesComponent {
  constructor(
    public matDialog: MatDialog,
    private safTChildProxyService: SafTChildProxyService,
  ) {
    this.safTChildProxyService.getUsers().subscribe((data) => {
      console.log(data);
    });
  }

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
