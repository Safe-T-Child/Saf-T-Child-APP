import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SafTChildProxyService } from './saf-t-child.service.proxy';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import { Token } from '../_models/token';

@Injectable({
  providedIn: 'root',
})
export class UserAuthenticationService {
  loggedIn = new BehaviorSubject<boolean>(this.checkInitialAuthState);

  get checkInitialAuthState(): boolean {
    // Example: Check if a token exists in localStorage
    let status = false;
    const token = localStorage.getItem('Saf-T-ChildToken');

    if (token) {
      status = this.checkTokenValidity();
    }

    // Consider additional checks here for token validity, expiration, etc.
    return status; // Returns true if token exists, false otherwise
  }

  constructor(private SafTChildProxyService: SafTChildProxyService) {}

  login(email: string, password: string): Observable<boolean> {
    return this.SafTChildProxyService.login(email, password).pipe(
      map((response) => {
        const token = response.token;
        const decodedToken: Token = jwtDecode(token);

        const isAuthenticated = Boolean(response); // or any other logic based on your response structure
        if (isAuthenticated) {
          localStorage.setItem('Saf-T-ChildToken', response.token);
          this.loggedIn.next(true);
        }
        return isAuthenticated;
      }),
      catchError((error) => {
        this.loggedIn.next(false);
        localStorage.removeItem('Saf-T-ChildToken');
        return [false];
      }),
    );
  }

  getFirstName(): string {
    const token = localStorage.getItem('Saf-T-ChildToken');
    if (!token) return '';
    const decodedToken: Token = jwtDecode(token);
    return decodedToken.firstName;
  }

  getLastName(): string {
    const token = localStorage.getItem('Saf-T-ChildToken');
    if (!token) return '';
    const decodedToken: Token = jwtDecode(token);
    return decodedToken.lastName;
  }

  getEmail(): string {
    const token = localStorage.getItem('Saf-T-ChildToken');
    if (!token) return '';
    const decodedToken: Token = jwtDecode(token);
    return decodedToken.email;
  }

  getUserName(): string {
    const token = localStorage.getItem('Saf-T-ChildToken');
    if (!token) return '';
    const decodedToken: Token = jwtDecode(token);
    return decodedToken.username;
  }

  getUserId(): string {
    const token = localStorage.getItem('Saf-T-ChildToken');
    if (!token) return '';
    const decodedToken: Token = jwtDecode(token);
    return decodedToken.userId;
  }

  checkTokenValidity(): boolean {
    const token = localStorage.getItem('Saf-T-ChildToken');
    if (!token) return false;
    const decodedToken: JwtPayload = jwtDecode(token);
    const currentTime = new Date().getTime() / 1000;

    if (decodedToken.exp === null || decodedToken.exp === undefined) {
      return false;
    }
    return decodedToken?.exp > currentTime;
  }

  logout(): void {
    this.loggedIn.next(false);
    localStorage.removeItem('Saf-T-ChildToken');
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }
}
