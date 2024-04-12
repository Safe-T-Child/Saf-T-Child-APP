import { VerificationCode } from './../_models/Twilio';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { environment } from '../environment';
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

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/authentication`, {
      email,
      password,
    });
  }

  getUserByEmail(email: string): Observable<SafTChildCore.User> {
    return this.http.get<SafTChildCore.User>(
      `${this.baseUrl}/${this.userController}/getUserByEmail?email=${email}`,
    );
  }

  getUserByPhoneNumber(phoneNumber: string): Observable<SafTChildCore.User> {
    //HARDCODE FOR NOW
    return this.http.get<SafTChildCore.User>(
      `${this.baseUrl}/${this.userController}/getUserByPhoneNumber?CountryCode=1&PhoneNumberValue=${phoneNumber}`,
    );
  }

  sendGroupInviteEmail(userId: string, groupId: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${this.groupController}/sendGroupInviteEmail?newUserId=${userId}&groupId=${groupId}`,
      {},
    );
  }

  updateGroup(group: SafTChildCore.Group): Observable<SafTChildCore.Group> {
    return this.http.put<SafTChildCore.Group>(
      `${this.baseUrl}/${this.groupController}/${group.id}`,
      group,
    );
  }

  getUsersByGroupId(groupId: string): Observable<SafTChildCore.User[]> {
    return this.http.get<SafTChildCore.User[]>(
      `${this.baseUrl}/${this.userController}/getUsersByGroupId?groupId=${groupId}`,
    );
  }

  updateUser(user: SafTChildCore.User): Observable<SafTChildCore.User> {
    return this.http.put<SafTChildCore.User>(
      `${this.baseUrl}/${this.userController}/updateUser?id=${user.id}`,
      user,
    );
  }

  getUser(userId: string): Observable<SafTChildCore.User> {
    const controller = 'user';
    return this.http.get<SafTChildCore.User>(
      `${this.baseUrl}/${controller}/getUserById?id=${userId}`,
    );
  }

  getRoles(): Observable<SafTChildCore.Role[]> {
    return this.http.get<SafTChildCore.Role[]>(
      `${this.baseUrl}/${this.userController}/getRoles`,
    );
  }

  insertNewUser(
    user: SafTChildCore.User,
    deviceActivationNumber: number,
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${this.userController}/insertUser?deviceActivationNumber=${deviceActivationNumber}`,
      user,
    );
  }

  insertTempUser(user: SafTChildCore.User, groupId: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${this.userController}/insertTempUser?groupId=${groupId}`,
      user,
    );
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

  insertNewVehicle(vehicle: SafTChildCore.Vehicle): Observable<any> {
    return this.http.post(`${this.baseUrl}/${this.vehicleController}`, vehicle);
  }

  updateVehicle(
    vehicle: SafTChildCore.Vehicle,
  ): Observable<SafTChildCore.Vehicle> {
    return this.http.put<SafTChildCore.Vehicle>(
      `${this.baseUrl}/${this.vehicleController}/${vehicle.id}`,
      vehicle,
    );
  }

  deleteVehicle(
    vehicle: SafTChildCore.Vehicle,
  ): Observable<SafTChildCore.Vehicle> {
    return this.http.delete<SafTChildCore.Vehicle>(
      `${this.baseUrl}/${this.vehicleController}/${vehicle.id}`,
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

  checkEmail(email: string): Observable<SafTChildCore.EmailTaken> {
    return this.http.get<SafTChildCore.EmailTaken>(
      `${this.baseUrl}/${this.validationController}/checkEmail?email=${email}`,
    );
  }

  //Reset password
  sendResetPasswordEmail(email: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${this.userController}/forgotUserPassword?email=${email}`,
      { email },
    );
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/${this.validationController}/verifyEmailAddress?tokenstring=${token}`,
    );
  }

  sendPhoneNumberVerificationCode(phoneNumber: string): Observable<any> {
    const phoneNumberURI = encodeURIComponent(phoneNumber);
    return this.http.post(
      `${this.baseUrl}/${this.validationController}/SendVerificationCode?phoneNumber=${phoneNumberURI}`,
      { phoneNumber },
    );
  }

  verifyPhoneNumber(phoneNumber: string, code: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${this.validationController}/VerifyCode`,
      { phoneNumber, code },
    );
  }

  sendEmailVerificationCode(email: string): Observable<any> {
    const emailUri = encodeURIComponent(email);
    return this.http.post(
      `${this.baseUrl}/${this.validationController}/sendVerificationEmail?email=${emailUri}`,
      { email },
    );
  }
}
