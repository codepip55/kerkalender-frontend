import {
  CanActivate,
  CanActivateChild,
  GuardResult,
  MaybeAsync,
  Router,
} from '@angular/router';
import { Injectable } from '@angular/core';
import { UserService } from '../services/user.service';
import { AlertService } from '../services/alert.service';
import { filter, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private userService: UserService,
    private alertService: AlertService,
    private router: Router,
  ) {}
  private checkUser() {
    return this.userService.loading$.pipe(
      filter(loading => !loading), // Wait until loading is false
      map(() => {
        const user = this.userService.currentUser;

        if (!user) {
          this.alertService.add({
            type: 'warning',
            message: 'Je moet ingelogd zijn om deze pagina te bezoeken.',
          });
          this.router.navigate(['/']);
          return false;
        }
        return true;
      }),
    );
  }

  canActivate(): MaybeAsync<GuardResult> {
    return this.checkUser();
  }
  canActivateChild(): MaybeAsync<GuardResult> {
    return this.checkUser();
  }
}
