import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserLoginService } from './user-login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  private authenticationState = false;

  constructor(private router: Router,
              private userLoginService: UserLoginService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    this.userLoginService.isAuthenticated(this);
    return of(this.authenticationState);
  }

  isLoggedIn(message: string, isLoggedIn: boolean) {
    if (message) {
      console.warn(message);
    }
    if (!isLoggedIn) {
      this.router.navigateByUrl('/login');
    }
    this.authenticationState = isLoggedIn;
  }

}
