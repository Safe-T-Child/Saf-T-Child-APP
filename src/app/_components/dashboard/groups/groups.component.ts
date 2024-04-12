import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GroupsModalComponent } from '../../modals/groups-modal/groups-modal.component';
import { SafTChildProxyService } from '../../../_services/saf-t-child.service.proxy';
import { UserAuthenticationService } from '../../../_services/user-authentication.service';
import { NamedDocumentKey } from '../../../_models/base';
import * as SafTChildCore from '../../../_models/Saf-T-Child';
@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
})
export class GroupsComponent {
  user: NamedDocumentKey = {
    id: this.userAuthenticationService.getUserId() || '',
    name: localStorage.getItem('name') || '',
  };
  users: SafTChildCore.User[] = [];
  groups: SafTChildCore.Group[] = [];
  constructor(
    public matDialog: MatDialog,
    private safTChildProxyService: SafTChildProxyService,
    private userAuthenticationService: UserAuthenticationService,
  ) {
    this.safTChildProxyService
      .getGroupsByOwnerId(this.user.id)
      .subscribe((groups) => {
        this.groups = groups;
      });
  }

  reload(): void {
    this.safTChildProxyService
      .getGroupsByOwnerId(this.user.id)
      .subscribe((groups) => {
        this.groups = groups;
      });
  }

  addFamilyMember(group: SafTChildCore.Group): void {
    const dialogRef = this.matDialog.open(GroupsModalComponent, {
      width: '300px',
      data: { inputData: group},
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      console.log(result);
      this.reload()
    });
  }

  editUser(group: SafTChildCore.Group, user: SafTChildCore.User): void {
    const dialogRef = this.matDialog.open(GroupsModalComponent, {
      width: '300px',
      data: { inputData: group, inputData2: user},
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      console.log(result);
      this.reload()
    });
  }

  deleteMember(): void {
    //remove user from the group, but do not want to actually delete user
    this.reload();
  }
}
