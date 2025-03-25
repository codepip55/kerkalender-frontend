import { inject, Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { CreateServiceDto } from '../models/dtos/service.dto';
import { AlertService } from './alert.service';
import { API_URL } from '../app.config';
import { CreateSetlistDto } from '../models/dtos/setlist.dto';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = inject(API_URL);
  constructor(
    private http: HttpClient,
    private alertService: AlertService,
  ) { }
  private handleError<T>(err: any, res: T, action: string): Observable<T> {
    console.error(err);
    this.alertService.add({ type: 'warning', message: err.error ? err.error.message : `Het is niet gelukt om '${action}' uit te voeren.` });
    return of(res);
  }

  /**
   * Create a new service
   * API: POST /api/services
   * Requires: date, start_time, end_time, location, notes (empty), service_manager_id, teams
   */
  createService(dto: CreateServiceDto) {
     return this.http.post(this.apiUrl + 'services', dto).pipe(
      catchError(err => this.handleError(err, { service: null }, 'dienst aanmaken'))
    );
  }

  /**
   * Get all services
   * API: GET /api/services
   */
  getServices() {
    return this.http.get(this.apiUrl + 'services').pipe(
      catchError(err => this.handleError(err, [], 'diensten ophalen'))
    );
  }

  /**
   * Get service by id
   */
  getService(id: number) {
    return this.http.get(this.apiUrl + 'services/' + id).pipe(
      catchError(err => this.handleError(err, {service: null}, 'dienst ophalen'))
    );
  }

  /**
   * Update service by id
   */
  updateService(id: number, dto: CreateServiceDto) {
    return this.http.put(this.apiUrl + 'services/' + id, dto).pipe(
      catchError(err => this.handleError(err, {service: null}, 'dienst bijwerken'))
    );
  }

  /**
   * Delete service by id
   */
  deleteService(id: number) {
    return this.http.delete(this.apiUrl + 'services/' + id).pipe(
      catchError(err => this.handleError(err, {service: null}, 'dienst verwijderen'))
    );
  };

  /**
   * Get setlist by id
   */
  getSetlist(id: number) {
    return this.http.get(this.apiUrl + 'setlists/' + id).pipe(
      catchError(err => this.handleError(err, {setlist: null}, 'setlist ophalen'))
    );
  }

  /**
   * Get setlist by service_id
   */
  getSetlistByServiceId(service_id: number) {
    return this.http.get(this.apiUrl + 'setlists/service/' + service_id).pipe(
      catchError(err => this.handleError(err, {setlist: null}, 'setlist ophalen'))
    );
  }

  /**
   * Update setlist by setlist_id
   */
  updateSetlist(id: number, dto: CreateSetlistDto) {
    return this.http.put(this.apiUrl + 'setlists/' + id, dto).pipe(
      catchError(err => this.handleError(err, {setlist: null}, 'setlist bijwerken'))
    );
  }

  /**
   * Get all users
   */
  getUsers() {
    return this.http.get(this.apiUrl + 'users').pipe(
      catchError(err => this.handleError(err, [], 'gebruikers ophalen'))
    );
  }

  /**
   * Get user by id
   */
  getUser(id: number) {
    return this.http.get(this.apiUrl + 'users/' + id).pipe(
      catchError(err => this.handleError(err, {user: null}, 'gebruiker ophalen'))
    );
  }

  /**
   * Get user in leader team
   */
  getLeaderTeamUser() {
    return this.http.get(this.apiUrl + 'users/leader').pipe(
      catchError(err => this.handleError(err, {user: null}, 'gebruiker ophalen'))
    );
  }
}
