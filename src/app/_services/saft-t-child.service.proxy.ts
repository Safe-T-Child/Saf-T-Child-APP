// saf-t-child.service.proxy.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { environment } from '../../../environment';
import * as SafTChildCore from '../_models/Saf-T-Child';

@Injectable({
  providedIn: 'root',
})
export class SafTChildProxyService {
  readonly validationController = 'validation';
  readonly userController = 'user';

  private baseUrl = environment.safTChildApiUrl + '/api';
  private apiUrl =
    'https://pngx6thynntc4hlwyrahc26e5u0cevyg.lambda-url.us-east-2.on.aws'; // For development
  // private apiUrl = 'https://saf-t-child-api.example.com'; // For production

  constructor(private http: HttpClient) {}

  getUsers(): Observable<SafTChildCore.User> {
    const controller = 'user';
    return this.http.get<SafTChildCore.User>(`${this.baseUrl}/${controller}`);
  }

  getSampleData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sample-endpoint`);
  }

  getDeviceInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getDeviceInfo`);
  }

  insertNewUser(user: SafTChildCore.User): Observable<any> {
    return this.http.post(`${this.baseUrl}/${this.userController}`, user);
  }

  //keep it with mock api for now. Endpoint is not ready
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }

  // Validators for new users
  checkUserName(username: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/${this.validationController}/checkUsername?userName=${username}`,
    );
  }

  checkPhoneNumber(
    phoneNumber: number,
    countryCode: number,
  ): Observable<boolean> {
    const phoneNumberString = phoneNumber.toString();
    const countryCodeString = countryCode.toString();
    return this.http.get<boolean>(
      `${this.baseUrl}/${this.validationController}/checkPhoneNumber?CountryCode=${countryCodeString}&PhoneNumberValue=${phoneNumberString}`,
    );
  }

  checkEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/${this.validationController}/checkEmail?email=${email}`,
    );
  }
}
