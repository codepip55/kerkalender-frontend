import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { HomeComponent as DashboardHomeComponent } from './pages/dashboard/home/home.component';
import { ServicePlannerComponent } from './pages/dashboard/service-planner/service-planner.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth_callback', component: HomeComponent },
  // Dashboard
  { path: 'dashboard', redirectTo: 'dashboard/home', pathMatch: 'full' },
  { path: 'dashboard/home', component: DashboardHomeComponent },
  { path: 'dashboard/services/:id', component: ServicePlannerComponent },
];
