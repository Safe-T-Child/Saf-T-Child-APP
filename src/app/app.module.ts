import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BootstrapSamplesComponent } from './_components/bootstrap-samples/bootstrap-samples.component';
import { MobileHeaderComponent } from './mobile-view/_components/mobile-header/mobile-header.component';
import { LoginComponent } from './_components/login/login.component';
import { DesktopHeaderComponent } from './desktop-view/_components/desktop-header/desktop-header.component';
import { FooterComponent } from './_components/footer/footer.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './_components/dashboard/dashboard.component';
import { CreateAccountComponent } from './_components/create-account/create-account.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DevicesComponent } from './_components/dashboard/devices/devices.component';
import { VehiclesComponent } from './_components/dashboard/vehicles/vehicles.component';
import { GroupsComponent } from './_components/dashboard/groups/groups.component';
import { AboutComponent } from './_components/about/about.component';
import { VehiclesModalComponent } from './_components/modals/vehicles-modal/vehicles-modal.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DevicesModalComponent } from './_components/modals/devices-modal/devices-modal.component';
import { GroupsModalComponent } from './_components/modals/groups-modal/groups-modal.component';
import { AuthInterceptor } from './_interceptor/auth-interceptor';
import { ResetPasswordComponent } from './_components/reset-password/reset-password.component';
import { VerifyEmailComponent } from './_components/verify-email/verify-email.component';
import { AcceptGroupInviteComponent } from './_components/accept-group-invite/accept-group-invite.component';
import { PageNotFoundComponent } from './_components/page-not-found/page-not-found.component';
import { DisplayTokenErrorComponent } from './_components/display-token-error/display-token-error.component';
import { GenerateResetPasswordComponent } from './_components/generate-reset-password/generate-reset-password.component';
import { FaqComponent } from './_components/faq/faq.component';
import { LoadingOverlayComponent } from './_components/loading-overlay/loading-overlay.component';

@NgModule({
  declarations: [
    AppComponent,
    BootstrapSamplesComponent,
    MobileHeaderComponent,
    LoginComponent,
    DesktopHeaderComponent,
    FooterComponent,
    DashboardComponent,
    CreateAccountComponent,
    DevicesComponent,
    VehiclesComponent,
    GroupsComponent,
    AboutComponent,
    VehiclesModalComponent,
    DevicesModalComponent,
    GroupsModalComponent,
    ResetPasswordComponent,
    VerifyEmailComponent,
    AcceptGroupInviteComponent,
    PageNotFoundComponent,
    DisplayTokenErrorComponent,
    GenerateResetPasswordComponent,
    FaqComponent,
    LoadingOverlayComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
