import { Component, HostListener } from '@angular/core';
import { windowBreakpoint } from '../../environment';
import { UserAuthenticationService } from './_services/user-authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [UserAuthenticationService],
})
export class AppComponent {
  title = 'saf-t-child';
  s = 'Capstone Project Team 7';
  // userAuthenticated = false;

  get userAuthenticated() {
    return this.userAuthenticationService.checkInitialAuthState;
  }

  constructor(
    private userAuthenticationService: UserAuthenticationService,
    private router: Router,
  ) {}

  //For menu on left
  isMobile: boolean = window.innerWidth < 1000; // Example breakpoint
  showOverlay: boolean = false;

  get overlayClass() {
    return this.showOverlay ? '' : 'menu-overlay-hidden';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth < 1000;
  }

  toggleOverlay(logout: boolean = false) {
    this.showOverlay = !this.showOverlay;

    if (logout) {
      this.logout();
    }
  }

  logout() {
    this.userAuthenticationService.logout();
    // route to login page
    this.router.navigate(['/login']);
  }
}
