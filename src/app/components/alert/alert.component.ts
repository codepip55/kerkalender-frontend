import { Component, OnDestroy, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Alert, AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';
import { faExclamationTriangle, faInfo, faCheckCircle, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { NgForOf, TitleCasePipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-alert',
    imports: [
        TitleCasePipe,
        FaIconComponent,
        NgForOf
    ],
    templateUrl: './alert.component.html',
    styleUrl: './alert.component.scss',
    animations: [
        trigger('toast', [
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'translateX(100%)'
                }),
                animate('500ms ease', style({
                    opacity: 1,
                    transform: 'translateX(0)'
                })),
            ]),
        ]),
    ]
})
export class AlertComponent implements OnInit, OnDestroy {
  faExclamationTriangle = faExclamationTriangle;
  faInfo = faInfo;
  faCheckCircle = faCheckCircle;
  faCircleExclamation = faCircleExclamation;

  alerts: Alert[] = [];
  alertSubscription: Subscription;

  constructor(private alertService: AlertService) { }

  icon(type: string): any {
    switch (type) {
      case 'success':
        return this.faCheckCircle;
      case 'warning':
        return this.faExclamationTriangle;
      case 'danger':
        return this.faCircleExclamation;
      case 'info':
        return this.faInfo;
    }
  }
  text(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'danger':
        return 'text-red-400';
      default:
        return 'text-sky-400';
    }
  }
  ngOnInit() {
    this.alertSubscription = this.alertService.alert$.subscribe({ next: (alert: Alert) => {
      this.alerts.push(alert);
      setTimeout(() => this.remove(alert), 5000);
    }});
  }
  remove(alert: Alert): void {
    this.alerts = this.alerts.filter((a) => a !== alert);
  }
  ngOnDestroy() {
    this.alertSubscription.unsubscribe();
  }
}
