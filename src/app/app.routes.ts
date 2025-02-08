import { Routes } from '@angular/router';
import { LoginComponent } from '../features/auth/login/login.component';
import { RegisterComponent } from '../features/auth/register/register.component';
import { DashboardComponent} from "../features/dashboard/dashboard.component";
import {HomeComponent} from "../features/home/home.component";
import {ProfileComponent} from "../features/profile/profile.component";
import {authGuard} from "../core/guards/auth.guard";
import {CollectorDashboardComponent} from "../features/collector-dashboard/collector-dashboard.component";

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        canActivate: [authGuard],
        data: { role: ['particulier']},
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [authGuard],
        data: { role: ['particulier','collecteur']},
      },
      {
        path: 'collection',
        component: CollectorDashboardComponent,
        canActivate: [authGuard],
        data: { role: ['collecteur']},
      }
      ]
  },
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', redirectTo: '/' },
];
