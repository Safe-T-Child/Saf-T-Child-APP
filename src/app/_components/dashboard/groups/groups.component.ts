import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GroupsModalComponent } from '../../modals/groups-modal/groups-modal.component';
import { SafTChildProxyService } from '../../../_services/saf-t-child.service.proxy';
import { UserAuthenticationService } from '../../../_services/user-authentication.service';
import { NamedDocumentKey } from '../../../_models/base';
import * as SafTChildCore from '../../../_models/Saf-T-Child';
import { Title } from '@angular/platform-browser';
import _ from 'lodash';
@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
})
export class GroupsComponent {
  isLoading = false;
  user: NamedDocumentKey = {
    id: this.userAuthenticationService.getUserId() || '',
    name: localStorage.getItem('name') || '',
  };
  users: SafTChildCore.User[] = [];
  group: SafTChildCore.Group = {} as SafTChildCore.Group;
  usersWithRoles: SafTChildCore.UserWithRole[] = [];

  constructor(
    public matDialog: MatDialog,
    private safTChildProxyService: SafTChildProxyService,
    private userAuthenticationService: UserAuthenticationService,
  ) {
    this.reload();
  }

  reload(): void {
    this.isLoading = true;
    this.safTChildProxyService
      .getGroupsByOwnerId(this.user.id)
      .subscribe((groups) => {
        if (groups.length === 0) {
          console.log('No groups found');
        }
        const group = groups[0];

        if (!group) {
          console.log('No group found');
          return;
        }
        this.group = group;
        this.usersWithRoles = group.users;

        this.safTChildProxyService
          .getUsersByGroupId(group?.id || '')
          .subscribe({
            next: (users) => {
              this.users = users;
            },
            complete: () => {
              this.isLoading = false;
            },
          });
      });
  }

  addFamilyMember(group: SafTChildCore.Group): void {
    const dialogRef = this.matDialog.open(GroupsModalComponent, {
      width: '300px',
      data: { inputData: group, title: 'Add' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      console.log(result);
      this.reload();
    });
  }

  getUserWithRole(user: SafTChildCore.User): SafTChildCore.UserWithRole | null {
    const role = _.find(this.group.users, (u) => u.id === user.id);
    if(role != null) {
        return role;
    }
    else {
      return null;
    }
    
  }

  editUser(group: SafTChildCore.Group, user: SafTChildCore.User): void {
    const role = _.find(group.users, (u) => u.id === user.id)?.role || '';

    const dialogRef = this.matDialog.open(GroupsModalComponent, {
      width: '300px',
      data: { inputData: group, userData: user, title: 'Edit', role: role },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.reload();
    });
  }

  deleteMember(user: SafTChildCore.User): void {
    if (confirm('Are you sure you want to delete this member?')) {
      const updatedUsers = _.remove(this.group.users, (u) => u.id !== user.id);
      this.group.users = updatedUsers;

      this.safTChildProxyService.updateGroup(this.group).subscribe((group) => {
        this.reload();
      });
    }
  }
}
