import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Alert {
  type: 'success' | 'warning' | 'danger' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  alert$: Subject<Alert>;

  constructor() {
    this.alert$ = new Subject<Alert>();
  }

  add(alert: Alert): void {
    alert.type ? null : alert.type = 'warning';
    this.alert$.next(alert);
  }
}
