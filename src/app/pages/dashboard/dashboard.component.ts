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
import { firstValueFrom } from 'rxjs';
import { NgFor } from '@angular/common';
import { Service } from '../../models/service.model';
import { format } from 'date-fns';

@Component({
  selector: 'app-dashboard',
  imports: [
    FaIconComponent,
    NgFor
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

  constructor(private router: Router, private apiService: ApiService) {
  }
  async ngOnInit() {
    const services$ = this.apiService.getServices();
    // @ts-ignore
    this.services = await firstValueFrom(services$);
    console.log(this.services)

    // Format services
    this.services = this.services.map((service: Service) => {
      service.date = this.formatDate(service.date);
      service.start_time = this.formatTime(service.start_time);
      service.end_time = this.formatTime(service.end_time);
      return service;
    });
  }

  newService() {
    this.router.navigate(['/dashboard/services/new']);
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
}
