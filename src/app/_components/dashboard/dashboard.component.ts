import { Component, HostListener, OnInit } from '@angular/core';
import { windowBreakpoint } from '../../environment';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { SafTChildProxyService } from '../../_services/saf-t-child.service.proxy';
import { UserAuthenticationService } from '../../_services/user-authentication.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  isMobile: boolean = window.innerWidth < windowBreakpoint;
  emailVerificationMessage = `Emai Verification has been sent. Please check your email to verify your account.`;
  showVerificationMessage = false;
  currentTab = 'devices';

  constructor(
    public matDialog: MatDialog,
    private route: ActivatedRoute,
    private safTChildProxyService: SafTChildProxyService,
    private userAuthenticationService: UserAuthenticationService,
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params['firstLogin']) {
        const userId = this.userAuthenticationService.getUserId();

        this.safTChildProxyService.getUser(userId).subscribe((user) => {
          if (!user.isEmailVerified) {
            this.showVerificationMessage = true;
            setTimeout(() => {
              this.showVerificationMessage = false;
            }, 5000);
          }
        });
      }

      //get current url
      const url = window.location.href;
      if (url.includes('devices')) {
        this.currentTab = 'devices';
      } else if (url.includes('vehicles')) {
        this.currentTab = 'vehicles';
      } else if (url.includes('groups')) {
        this.currentTab = 'family';
      }
    });
  }

  changeTab(tab: string) {
    this.currentTab = tab;
  }

  ngOnInit() {}

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth < windowBreakpoint;
  }
}
