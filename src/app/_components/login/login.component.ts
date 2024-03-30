import { Component, HostListener, Input, OnInit } from '@angular/core';
import { windowBreakpoint } from '../../environment';
import { SafTChildProxyService } from '../../_services/saf-t-child.service.proxy';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserAuthenticationService } from '../../_services/user-authentication.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [UserAuthenticationService],
})
export class LoginComponent implements OnInit {
  // Class binding property
  contentActive = false;
  showInvalidLogin = false;
  isLoading = false;

  email: FormControl<any | null> = new FormControl(null, Validators.required);
  password: FormControl<any | null> = new FormControl(
    null,
    Validators.required,
  );
  formGroup: FormGroup = new FormGroup({
    email: this.email,
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
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth < windowBreakpoint;
  }
  constructor(
    private router: Router,
    private userAuthenticationService: UserAuthenticationService,
  ) {}
  login() {
    console.log(this.formGroup);
    this.isLoading = true;
    this.userAuthenticationService
      .login(this.email.value, this.password.value)
      .subscribe((response) => {
        this.isLoading = false;
        if (response) {
          this.router.navigate(['/dashboard']);
        } else {
          this.showInvalidLogin = true;
        }
      });
  }
}
