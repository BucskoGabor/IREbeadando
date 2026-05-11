import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login';
import { MemberListComponent } from './components/member-list/member-list';
import { MemberFormComponent } from './components/member-form/member-form';
import { MemberDetailComponent } from './components/member-detail/member-detail';
import { ItemListComponent } from './components/item-list/item-list';
import { ItemFormComponent } from './components/item-form/item-form';
import { ItemDetailComponent } from './components/item-detail/item-detail';
import { LoanCreateComponent } from './components/loan-create/loan-create';
import { OverdueListComponent } from './components/overdue-list/overdue-list';
import { SettingsComponent } from './components/settings/settings';
import { DashboardComponent } from './components/dashboard/dashboard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'members', component: MemberListComponent, canActivate: [authGuard] },
  { path: 'members/new', component: MemberFormComponent, canActivate: [authGuard] },
  { path: 'members/:id', component: MemberDetailComponent, canActivate: [authGuard] },
  { path: 'members/:id/edit', component: MemberFormComponent, canActivate: [authGuard] },
  { path: 'items', component: ItemListComponent, canActivate: [authGuard] },
  { path: 'items/new', component: ItemFormComponent, canActivate: [authGuard] },
  { path: 'items/:id', component: ItemDetailComponent, canActivate: [authGuard] },
  { path: 'items/:id/edit', component: ItemFormComponent, canActivate: [authGuard] },
  { path: 'loans/new', component: LoanCreateComponent, canActivate: [authGuard] },
  { path: 'overdue', component: OverdueListComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];
