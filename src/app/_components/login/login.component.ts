import { Component, HostListener, Input, OnInit } from '@angular/core';
import { windowBreakpoint } from '../../../../environment';
import { SafTChildProxyService } from '../../_services/saft-t-child.service.proxy';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserAuthenticationService } from '../../_services/user-authentication.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [SafTChildProxyService, UserAuthenticationService],
})
export class LoginComponent implements OnInit {
  // Class binding property
  contentActive = false;
  showInvalidLogin = false;
  isLoading = false;

  username: FormControl<any | null> = new FormControl(
    null,
    Validators.required,
  );
  password: FormControl<any | null> = new FormControl(
    null,
    Validators.required,
  );
  formGroup: FormGroup = new FormGroup({
    username: this.username,
    password: this.password,
  });

  isMobile: boolean = window.innerWidth < windowBreakpoint; // Example breakpoint

  ngOnInit() {
    this.userAuthenticationService.isLoggedIn().subscribe((isLoggedIn) => {
      console.log(isLoggedIn);
      if (isLoggedIn) {
        this.router.navigate(['/dashboard']);
      }
    });

    this.contentActive = true;
    this.SafTChildProxyService.getDeviceInfo().subscribe((data) => {
      console.log(data);
    });
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth < windowBreakpoint;
  }
  constructor(
    private SafTChildProxyService: SafTChildProxyService,
    private router: Router,
    private userAuthenticationService: UserAuthenticationService,
  ) {}
  login() {
    console.log(this.formGroup);
    this.isLoading = true;
    this.userAuthenticationService
      .login(this.username.value, this.password.value)
      .subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          this.router.navigate(['/dashboard']);
        } else {
          this.showInvalidLogin = true;
        }
        this.isLoading = false;
      });
  }
}
