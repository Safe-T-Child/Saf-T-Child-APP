import { Component } from '@angular/core';
import { UserAuthenticationService } from '../../_services/user-authentication.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  constructor(private userAuthenticationService: UserAuthenticationService) {}
  get userAuthenticated() {
    return this.userAuthenticationService.checkInitialAuthState;
  }
}
