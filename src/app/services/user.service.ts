import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, filter, first, Observable, of, switchMap, tap } from 'rxjs';
import { User } from '../models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model';

const apiUrl = 'http://localhost:8000/';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject: BehaviorSubject<User | null>;
  private tokenSubject: BehaviorSubject<string>;
  private loadingSubject: BehaviorSubject<boolean>;
  private refreshTimeout: ReturnType<typeof setTimeout>;

  public token$: Observable<string>;
  public currentUser$: Observable<User | null>;
  public loading$: Observable<boolean>;
  public silentLoading$: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.tokenSubject = new BehaviorSubject<string>('');
    this.loadingSubject = new BehaviorSubject<boolean>(true);

    this.currentUser$ = this.currentUserSubject.asObservable();
    this.token$ = this.tokenSubject.asObservable();
    this.loading$ = this.loadingSubject.asObservable();
  }

  public login(redirectTo: string = '/') {
    this.loadingSubject.next(true);

    const nonce = 'kk_redirect_' + Math.random().toString(37).replace(/[^a-z]+/g, '');
    const state = { redirectTo };

    window.sessionStorage.setItem(nonce, JSON.stringify(state));

    document.location.href = apiUrl + 'auth/login?state=' + nonce;
  }
  public logout() {
    this.loadingSubject.next(true);
    this.http.get<any>(apiUrl + 'auth/logout').pipe(
      catchError(err => {
        console.error(err);
        // this.alertService.add({ type: 'warning', message: 'Could not remove refresh cookie' });
        return of();
      }),
      tap(_ => {
        this.currentUserSubject.next(null);
        this.tokenSubject.next('');

        if (this.refreshTimeout) {
          clearTimeout(this.refreshTimeout);
        }

        this.router.navigate(['/']);
        this.loadingSubject.next(false);
      })
    ).subscribe();
  }
  public handleCallback() {
    let nonce: string;
    this.loadingSubject.next(true);
    this.route.queryParamMap.pipe(
      tap(qs => nonce = qs.get('state') || ''),
      filter(qs => !!qs.get('code')),
      first(),
      switchMap(qs => this.http.get<ApiResponse>(`${apiUrl}auth/callback?code=${qs.get('code')}&state=${nonce}`)),
    ).subscribe({ next: (res) => {
        this.currentUserSubject.next(res.user);
        this.tokenSubject.next(res.token);
        // Attempt to refresh 1 min before token expires
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = setTimeout(() => this.silentAuth(), res.expiresIn - 60 * 1000);

        if (nonce !== '') {
          const state = window.sessionStorage.getItem(nonce);
          if (state) {
            const stateObj = JSON.parse(state);
            const redirectTo = this.router.parseUrl(stateObj.redirectTo);
            this.router.navigateByUrl(redirectTo);
            this.loadingSubject.next(false);
            return;
          }
        }

        this.loadingSubject.next(false);
      }, error: (err) => {
        console.error(err);
        // this.alertService.add({ type: 'danger', message: 'Could not log in' });
        this.router.navigate(['/']);
        this.loadingSubject.next(false);
      }
    });
  }
  public silentAuth(initialLoad: boolean = false) {
    this.loadingSubject.next(true);
    this.http.get<ApiResponse>(`${apiUrl}auth/silent`, { withCredentials: true }).pipe(
      first()
    ).subscribe({
      next: (res) => {
        this.currentUserSubject.next(res.user);
        this.tokenSubject.next(res.token);
        // Attempt to refresh 1 min before token expires
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = setTimeout(() => this.silentAuth(), res.expiresIn - 60 * 1000);
        this.loadingSubject.next(false);
      }, error: (_err) => {
        if (!initialLoad) {
          // this.alertService.add({ type: 'warning', message: 'Could not refresh token. Please save your work and refresh the page' });
        }
        this.loadingSubject.next(false);
      }
    });
  }

  public get currentUser(): User | null { return this.currentUserSubject.value; }
  public get token(): string { return this.tokenSubject.value; }
  public get loggedIn(): boolean { return this.currentUser !== null; }
}
