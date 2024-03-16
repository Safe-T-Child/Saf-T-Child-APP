import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SafTChildProxyService } from './saft-t-child.service.proxy';

@Injectable({
  providedIn: 'root',
})
export class UserAuthenticationService {
  loggedIn = new BehaviorSubject<boolean>(this.checkInitialAuthState);

  get checkInitialAuthState(): boolean {
    // Example: Check if a token exists in localStorage
    const token = localStorage.getItem('userToken');
    // Consider additional checks here for token validity, expiration, etc.
    return !!token; // Returns true if token exists, false otherwise
  }

  constructor(private SafTChildProxyService: SafTChildProxyService) {}

  login(username: string, password: string): Observable<boolean> {
    return this.SafTChildProxyService.login(username, password).pipe(
      map((response) => {
        console.log(response);
        const isAuthenticated = Boolean(response); // or any other logic based on your response structure
        if (isAuthenticated) {
          localStorage.setItem('userToken', 'yourTokenValue'); // Set actual token value here
          console.log(this.checkInitialAuthState);
        }
        return isAuthenticated;
      }),
      catchError((error) => {
        this.loggedIn.next(false);
        localStorage.removeItem('userToken');
        return [false];
      }),
    );
  }

  logout(): void {
    this.loggedIn.next(false);
    localStorage.removeItem('userToken');
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }
}
