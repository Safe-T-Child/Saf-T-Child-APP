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
  readonly deviceController = 'device';
  readonly groupController = 'group';
  readonly vehicleController = 'vehicle';

  private baseUrl = environment.safTChildApiUrl + '/api';
  private apiUrl =
    'https://pngx6thynntc4hlwyrahc26e5u0cevyg.lambda-url.us-east-2.on.aws'; // For development
  // private apiUrl = 'https://saf-t-child-api.example.com'; // For production

  constructor(private http: HttpClient) {}

  getDevices(): Observable<SafTChildCore.Device> {
    // add token to header for authentication
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjY1ZjVlZDhhZWI0Y2EzMTgzMGQ5NDlmNSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2dpdmVubmFtZSI6IlRlc3RpbmdOYW1lIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvc3VybmFtZSI6IlRlc3RpbmdMYXN0TmFtZSIsImV4cCI6MTcxMTEyNjI5OCwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzE2NCIsImF1ZCI6Imh0dHBzOi8vbG9jYWxob3N0OjcxNjQifQ.JxBxsFo9C-OldZ2MGZ6hX6MmMkU9rgzDG7dDCjYcCT0';
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.get<SafTChildCore.Device>(`${this.baseUrl}/device`, {
      headers,
    });
  }

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

  // Devices endpoints
  updateDevice(device: SafTChildCore.Device): Observable<SafTChildCore.Device> {
    return this.http.put<SafTChildCore.Device>(
      `${this.baseUrl}/${this.deviceController}/${device.id}`,
      device,
    );
  }

  getDevicesByOwnerId(ownerId: string): Observable<SafTChildCore.Device[]> {
    return this.http.get<SafTChildCore.Device[]>(
      `${this.baseUrl}/${this.deviceController}/by-owner/${ownerId}`,
    );
  }

  getDeviceByActivationCode(number: string): Observable<SafTChildCore.Device> {
    return this.http.get<SafTChildCore.Device>(
      `${this.baseUrl}/${this.deviceController}/by-activation-code/${number}`,
    );
  }

  // Groups
  getGroupsByOwnerId(ownerId: string): Observable<SafTChildCore.Group[]> {
    return this.http.get<SafTChildCore.Group[]>(
      `${this.baseUrl}/${this.groupController}/by-owner/${ownerId}`,
    );
  }

  // Vehicles
  getVehiclesByOwnerId(ownerId: string): Observable<SafTChildCore.Vehicle[]> {
    return this.http.get<SafTChildCore.Vehicle[]>(
      `${this.baseUrl}/${this.vehicleController}/by-owner/${ownerId}`,
    );
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
