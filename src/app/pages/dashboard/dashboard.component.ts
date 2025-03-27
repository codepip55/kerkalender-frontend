import { Component, OnInit } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCircleCheck,
  faCircleQuestion,
  faCircleRight,
  faCircleXmark,
  faFloppyDisk
} from '@fortawesome/free-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';
import { Service } from '../../models/service.model';
import { format } from 'date-fns';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    FaIconComponent,
    NgFor,
    NgIf
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  protected readonly faCircleRight = faCircleRight;
  protected readonly faCircleCheck = faCircleCheck;
  protected readonly faCircleXmark = faCircleXmark;
  protected readonly faCircleQuestion = faCircleQuestion;
  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faPlus = faPlus;

  public services: Service[] = [];
  public userRequests;

  constructor(private router: Router, private apiService: ApiService, private userService: UserService, private alertService: AlertService) {
  }
  async ngOnInit() {
    const services$ = this.apiService.getServices();
    // @ts-ignore
    this.services = await firstValueFrom(services$);

    // Format services
    this.services = this.services.map((service: Service) => {
      service.date = this.formatDate(service.date);
      service.start_time = this.formatTime(service.start_time);
      service.end_time = this.formatTime(service.end_time);
      return service;
    });

    // Get user requests
    const userRequests$ = this.apiService.getUserRequests(parseInt(this.userService.currentUser?.id || '0', 10));
    // @ts-ignore
    const userRequests = await lastValueFrom(userRequests$);
    // @ts-ignore
    this.userRequests = userRequests.data;
    console.log(this.userRequests);
  }

  newService() {
    this.router.navigate(['/dashboard/services/new']);
  }
  updateStatus(status: string, request: any) {
    const response = this.apiService.updateRequestStatus(request, status, parseInt(this.userService.currentUser?.id || '0', 10));
    response.subscribe(() => {
      request.status = status;
      this.alertService.add({type: 'success', message: `Status van uw verzoek is bijgewerkt naar ${status}`});
    });
    this.router.navigate(['/dashboard']);
  }
  formatTime(time: string) {
    const date = new Date();
    const [hours, minutes, seconds] = time.split(':');
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds, 10));

    return date.toLocaleTimeString("nl-NL", {hour: "2-digit", minute: "2-digit"});
  }
  formatDate(date: string) {
    const isoDate = new Date(date).toISOString();
    return format(new Date(isoDate), 'dd/MM/yyyy');
  }
  getIcon(status: string) {
    switch (status) {
      case 'waiting':
        return this.faCircleQuestion;
      case 'accepted':
        return this.faCircleCheck;
      case 'denied':
        return this.faCircleXmark;
      default:
        return this.faCircleQuestion;
    }
  }
  getIconClass(status: string) {
    switch (status) {
      case 'waiting':
        return 'text-secondary-500';
      case 'accepted':
        return 'text-primary-600';
      case 'denied':
        return 'text-gray-400';
      default:
        return 'text-secondary-500';
    }
  }
}
