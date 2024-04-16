import { Component, HostListener, OnDestroy } from '@angular/core';
import { windowBreakpoint } from '../../environment';
import { Router } from '@angular/router';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import { FormControl, Validators } from '@angular/forms';
import { SafTChildProxyService } from '../../_services/saf-t-child.service.proxy';
import { Group, User } from '../../_models/Saf-T-Child';
import { set } from 'lodash';
import _ from 'lodash';

interface InviteClaims {
  groupId: string;
  newUserID: string;
}

@Component({
  selector: 'app-accept-group-invite',
  templateUrl: './accept-group-invite.component.html',
  styleUrl: './accept-group-invite.component.scss',
})
export class AcceptGroupInviteComponent implements OnDestroy {
  alertMessage = '';
  isMobile: boolean = window.innerWidth < windowBreakpoint;
  token: string = '';
  tokenIsGood: boolean = false;
  groupId: string = '';
  userId: string = '';
  verificationSent = false;
  phoneNumber = '';
  isSendingVerification = false;
  canResend = false;
  countdown = 45;
  codeVerified = false;
  wrongVerificationCode = false;
  group: Group | null = null;
  isLoading = false;
  alertClass = '';
  tokenAlertMessage = '';
  showAlert = false;
  user: User | null = null;
  owner: User | null = null;

  verificationCode: FormControl<string | null> = new FormControl<string | null>(
    null,
    Validators.pattern('^[0-9]*$'),
  );

  constructor(
    private router: Router,
    private safTChildProxyService: SafTChildProxyService,
  ) {
    // Read query params
    this.router.routerState.root.queryParams.subscribe((params) => {
      if (params['token']) {
        this.token = params['token'];
        this.checkToken();
      } else {
        this.tokenAlertMessage = 'No token';
        // this.router.navigate(['']);
      }
    });
  }

  ngOnDestroy(): void {
    localStorage.removeItem('temporaryToken');
  }

  checkToken() {
    try {
      const decodedToken: JwtPayload = jwtDecode(this.token); // Decode the token
      // Check if token is expired
      const currentTime = new Date().getTime() / 1000;

      if (decodedToken.exp === null || decodedToken.exp === undefined) {
        this.tokenAlertMessage = 'Invalid token'; // Token is invalid
        return;
      }

      if (decodedToken.exp > currentTime) {
        localStorage.setItem('temporaryToken', this.token); // Save the token to local storage
        const tokenData = decodedToken as InviteClaims;
        this.tokenIsGood = true;
        this.groupId = tokenData.groupId;
        this.userId = tokenData.newUserID;
        this.isLoading = true;
        this.safTChildProxyService.getGroupById(this.groupId).subscribe({
          next: (res) => {
            this.group = res;

            if (
              res.users.find((u) => u.id === this.userId)?.acceptedInvite ===
              true
            ) {
              this.alertMessage = 'Invite already accepted';
              this.alertClass = 'alert-success';
              this.showAlert = true;
              setTimeout(() => {
                this.router.navigate(['dashboard']);
              }, 3000);
              this.isLoading = false;
            }

            this.isLoading = true;
            this.safTChildProxyService.getUser(this.userId).subscribe({
              next: (res) => {
                this.owner = res;
                this.isLoading = false;
              },
              error: (e) => {
                this.isLoading = false;
              },
            });
          },
          error: (e) => {
            this.isLoading = false;
          },
        });

        this.isLoading = true;
        this.safTChildProxyService.getUser(this.userId).subscribe({
          next: (res) => {
            this.user = res;
            this.phoneNumber =
              '+1' + String(res.primaryPhoneNumber.phoneNumberValue);
            this.isLoading = false;
          },
          error: (e) => {
            this.isLoading = false;
          },
        });
      } else {
        this.tokenAlertMessage = 'Token expired'; // Token is expired
      }
    } catch (error) {
      this.tokenAlertMessage = 'Invalid token';
    }
  }

  acceptInvite() {
    if (!this.codeVerified || !this.group) {
      return;
    }

    // update the group with the new user
    const user = this.group.users.find((u) => u.id === this.userId);

    if (!user) {
      this.alertClass = 'alert-danger';
      this.alertMessage = 'Error accepting invite. Please try again.';
      this.showAlert = true;
      setTimeout(() => {
        this.showAlert = false;
      }, 3000);
      return;
    }

    user.acceptedInvite = true;

    const newUsers = this.group.users.filter((u) => u.id !== this.userId);
    newUsers.push(user);
    this.group.users = newUsers;

    this.isLoading = true;
    this.safTChildProxyService.updateGroup(this.group).subscribe({
      next: (res) => {
        this.alertMessage = 'Invite accepted';
        this.isLoading = false;
        this.alertClass = 'alert-success';
        this.showAlert = true;

        setTimeout(() => {
          this.router.navigate(['dashboard']);
        }, 3000);
      },
      error: (e) => {
        this.alertMessage = 'Error accepting invite. Please try again.';
        this.isLoading = false;
        this.alertClass = 'alert-danger';
        this.showAlert = true;
      },
    });
  }

  declineInvite() {
    if (!this.group) {
      return;
    }

    // remove the user from the group
    this.group.users = this.group.users.filter((u) => u.id !== this.userId);

    this.isLoading = true;
    this.safTChildProxyService.updateGroup(this.group).subscribe({
      next: (res) => {
        this.alertMessage = 'Invite declined';
        this.isLoading = false;
        this.alertClass = 'alert-success';
        this.showAlert = true;

        setTimeout(() => {
          this.router.navigate(['dashboard']);
        }, 3000);
      },
      error: (e) => {
        this.alertMessage = 'Error declining invite. Please try again.';
        this.isLoading = false;
        this.alertClass = 'alert-danger';
        this.showAlert = true;
      },
    });
  }

  sendVerification() {
    const phoneNumberString = this.phoneNumber;

    if (!phoneNumberString) {
      return;
    }

    this.isSendingVerification = true;

    this.safTChildProxyService
      .sendPhoneNumberVerificationCode(phoneNumberString)
      .subscribe({
        next: (res) => {
          this.verificationSent = true;
          // add 45 second timer
          this.isSendingVerification = false;
          this.canResend = false;
          this.countdown = 45;
          setTimeout(() => (this.canResend = true), 45000); // 45 seconds till resend is allowed

          // Start the countdown
          let interval = setInterval(() => {
            this.countdown--;
            if (this.countdown === 0) {
              clearInterval(interval);
            }
          }, 1000);
        },
        error: (e) => {
          this.isSendingVerification = false;
          console.log(e);
        },
      });
  }

  verifyCode() {
    const value = this.verificationCode.value;
    const phoneNumber = this.phoneNumber;
    this.wrongVerificationCode = false;

    if (!value || !phoneNumber) {
      return;
    }

    this.safTChildProxyService.verifyPhoneNumber(phoneNumber, value).subscribe({
      next: (res) => {
        if (res.status === 'approved') {
          this.codeVerified = true;
          console.log(this.codeVerified);
        } else {
          this.wrongVerificationCode = true;
        }
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth < windowBreakpoint;
  }
}
