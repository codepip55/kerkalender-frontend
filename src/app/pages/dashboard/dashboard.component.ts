import { Component } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCircleCheck, faCircleQuestion, faCircleRight, faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    FaIconComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  protected readonly faCircleRight = faCircleRight;
  protected readonly faCircleCheck = faCircleCheck;
  protected readonly faCircleXmark = faCircleXmark;
  protected readonly faCircleQuestion = faCircleQuestion;
  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faPlus = faPlus;

  constructor(private router: Router) {
  }

  newService() {
    this.router.navigate(['/dashboard/services/new']);
  }
}
