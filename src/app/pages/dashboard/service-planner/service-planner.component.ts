import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-service-planner',
  imports: [RouterOutlet, NgClass],
  templateUrl: './service-planner.component.html',
  styleUrl: './service-planner.component.scss',
})
export class ServicePlannerComponent {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

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
    return this.activatedRoute.snapshot.firstChild?.routeConfig?.path;
  }
}
