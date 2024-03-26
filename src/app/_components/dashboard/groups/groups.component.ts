import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GroupsModalComponent } from '../../modals/groups-modal/groups-modal.component';
import { SafTChildProxyService } from '../../../_services/saf-t-child.service.proxy';
import { UserAuthenticationService } from '../../../_services/user-authentication.service';
import { NamedDocumentKey } from '../../../_models/base';
@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
})
export class GroupsComponent {
  user: NamedDocumentKey = {
    id: this.userAuthenticationService.getUserId() || '',
    name: this.userAuthenticationService.getFirstName() || '',
  };
  constructor(
    public matDialog: MatDialog,
    private safTChildProxyService: SafTChildProxyService,
    private userAuthenticationService: UserAuthenticationService,
  ) {
    this.safTChildProxyService
      .getGroupsByOwnerId(this.user.id)
      .subscribe((groups) => {
        console.log(groups);
      });
  }

  openDialog(): void {
    const dialogRef = this.matDialog.open(GroupsModalComponent, {
      width: '300px',
      data: { inputData: 'your data' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      console.log(result);
    });
  }
}
