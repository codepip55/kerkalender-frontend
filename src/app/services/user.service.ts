import { inject, Inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, catchError, filter, first, Observable, of, switchMap, tap } from 'rxjs';
import { User } from '../models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model';
import { AlertService } from './alert.service';
import { API_URL } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {
  private currentUserSubject: BehaviorSubject<User | null>;
  private tokenSubject: BehaviorSubject<string>;
  private loadingSubject: BehaviorSubject<boolean>;
  private refreshTimeout: ReturnType<typeof setTimeout>;
  private subscriptions: any[] = [];
  private apiUrl = inject(API_URL);

  public token$: Observable<string>;
  public currentUser$: Observable<User | null>;
  public loading$: Observable<boolean>;
  public silentLoading$: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private alertService: AlertService,
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.tokenSubject = new BehaviorSubject<string>('');
    this.loadingSubject = new BehaviorSubject<boolean>(true);

    this.currentUser$ = this.currentUserSubject.asObservable();
    this.token$ = this.tokenSubject.asObservable();
    this.loading$ = this.loadingSubject.asObservable();
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.currentUserSubject.unsubscribe();
    this.tokenSubject.unsubscribe();
    this.loadingSubject.unsubscribe();
  }

  public login(redirectTo: string = '/') {
    this.loadingSubject.next(true);

    const nonce = 'kk_redirect_' + Math.random().toString(36).replace(/[^a-z]+/g, '');
    const state = { redirectTo };

    window.sessionStorage.setItem(nonce, JSON.stringify(state));

    document.location.href = this.apiUrl + 'auth/kerkalender?state=' + nonce;
  }
  public logout() {
    this.loadingSubject.next(true);
    const sub = this.http.get<any>(this.apiUrl + 'auth/logout').pipe(
      catchError(err => {
        console.error(err);
        this.alertService.add({ type: 'warning', message: 'Could not remove refresh token' });
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
    this.subscriptions.push(sub);
  }
  public handleCallback() {
    let nonce: string;
    this.loadingSubject.next(true);
    const sub = this.route.queryParamMap.pipe(
      tap(qs => nonce = qs.get('state') || ''),
      filter(qs => !!qs.get('code')),
      first(),
      switchMap(qs => this.http.get<ApiResponse>(`${this.apiUrl}auth/kerkalender?code=${qs.get('code')}&state=${nonce}`)),
    ).subscribe({ next: (res) => {
        this.currentUserSubject.next(res.user);
        this.tokenSubject.next(res.token);
        // Attempt to refresh 1 min before token expires
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = setTimeout(() => this.silentAuth(), res.expires_in - (60 * 1000));

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
        this.alertService.add({ type: 'danger', message: 'Could not log in' });
        this.router.navigate(['/']);
        this.loadingSubject.next(false);
      }
    });
    this.subscriptions.push(sub);
  }
  public silentAuth(initialLoad: boolean = false) {
    this.loadingSubject.next(true);
    const sub = this.http.get<ApiResponse>(`${this.apiUrl}auth/silent`, { withCredentials: true }).pipe(
      first()
    ).subscribe({
      next: (res) => {
        this.currentUserSubject.next(res.user);
        this.tokenSubject.next(res.token);
        // Attempt to refresh 1 min before token expires
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = setTimeout(() => this.silentAuth(), res.expires_in - (60 * 1000));
        this.loadingSubject.next(false);
      }, error: (_err) => {
        console.error(_err);
        if (!initialLoad) {
          this.alertService.add({ type: 'warning', message: 'Could not refresh token. Please save your work and refresh the page' });
        }
        this.loadingSubject.next(false);
      }
    });
    this.subscriptions.push(sub);
  }

  public getInitials(firstName: string, lastName: string) {
    return firstName[0].toUpperCase() + lastName[0].toUpperCase();
  }

  public get currentUser(): User | null { return this.currentUserSubject.value; }
  public get token(): string { return this.tokenSubject.value; }
  public get loggedIn(): boolean { return this.currentUser !== null; }
}
