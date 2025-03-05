import { Component } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCircleCheck, faCircleQuestion, faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-service-planner',
  imports: [
    FaIconComponent,
    RouterOutlet,
    NgClass
  ],
  templateUrl: './service-planner.component.html',
  styleUrl: './service-planner.component.scss'
})
export class ServicePlannerComponent {

  protected readonly faCircleCheck = faCircleCheck;
  protected readonly faCircleQuestion = faCircleQuestion;
  protected readonly faCircleXmark = faCircleXmark;
  protected readonly faTrash = faTrash;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
  }

  setTab(tab: string) {
    switch (tab) {
      case 'info':
        this.router.navigate(['info'], { relativeTo: this.activatedRoute });
        break;
      case 'setlist':
        this.router.navigate(['setlist'], { relativeTo: this.activatedRoute });
        break;
      default:
        this.router.navigate(['info'], { relativeTo: this.activatedRoute });
    }
  }
  get currentTab() {
    // @ts-ignore
    return this.activatedRoute.snapshot.firstChild.routeConfig.path;
  }
}
