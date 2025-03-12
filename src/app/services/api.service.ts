import { inject, Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { CreateServiceDto } from '../models/dtos/service.dto';
import { AlertService } from './alert.service';
import { API_URL } from '../app.config';

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
}
