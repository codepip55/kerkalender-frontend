import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ServicePlannerComponent } from './pages/dashboard/service-planner/service-planner.component';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CalendarComponent } from './pages/dashboard/calendar/calendar.component';
import { InfoComponent } from './pages/dashboard/service-planner/info/info.component';
import { SetlistComponent } from './pages/dashboard/service-planner/setlist/setlist.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth_callback', component: HomeComponent },
  // Dashboard
  { path: 'dashboard', redirectTo: 'dashboard/home', pathMatch: 'full' },
  { path: 'dashboard/home', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/services/:id', component: ServicePlannerComponent, children: [
      { path: 'info', component: InfoComponent },
      { path: 'setlist', component: SetlistComponent },
      { path: '', redirectTo: 'info', pathMatch: 'full' }
    ], canActivateChild: [AuthGuard] },
  { path: 'dashboard/calendar', component: CalendarComponent }
];
