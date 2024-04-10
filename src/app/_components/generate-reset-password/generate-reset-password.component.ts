import { Component, HostListener } from '@angular/core';
import { windowBreakpoint } from '../../environment';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SafTChildProxyService } from '../../_services/saf-t-child.service.proxy';
import { Router } from '@angular/router';

@Component({
  selector: 'app-generate-reset-password',
  templateUrl: './generate-reset-password.component.html',
  styleUrl: './generate-reset-password.component.scss',
})
export class GenerateResetPasswordComponent {
  isMobile: boolean = false;
  emailSending: boolean = false;
  emailSent: boolean = false;

  email: FormControl<string> = this.fb.nonNullable.control('', [
    Validators.required,
    Validators.email,
  ]);

  constructor(
    private fb: FormBuilder,
    private safTChildProxyService: SafTChildProxyService,
    private router: Router,
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth < windowBreakpoint;
  }

  sendEmail() {
    this.emailSending = true;
    this.safTChildProxyService
      .sendResetPasswordEmail(this.email.value)
      .subscribe(
        (response) => {
          this.emailSending = false;
          this.emailSent = true;
          this.router.navigate(['/login']);
        },
        (error) => {
          if (error.status === 404) {
            this.emailSending = false;
            this.emailSent = true;
            this.router.navigate(['/login']);
            return;
          }
          this.emailSending = false;
          this.emailSent = true;
          throw new Error('Error sending email');
        },
      );
  }
}
