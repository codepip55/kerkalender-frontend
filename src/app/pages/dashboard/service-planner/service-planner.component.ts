import { Component } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCircleCheck, faCircleQuestion, faCircleXmark } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-service-planner',
  imports: [
    FaIconComponent
  ],
  templateUrl: './service-planner.component.html',
  styleUrl: './service-planner.component.scss'
})
export class ServicePlannerComponent {

  protected readonly faCircleCheck = faCircleCheck;
  protected readonly faCircleQuestion = faCircleQuestion;
  protected readonly faCircleXmark = faCircleXmark;
}
