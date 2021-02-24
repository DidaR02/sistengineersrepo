import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInUserComponent } from './components/signin-user/signin-user.component';
import { SignUpUserComponent } from './components/signup-user/signup-user.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { AuthGuard } from 'src/app/Service/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/sign-in', pathMatch: 'full'},
  { path: 'register-user', redirectTo: '/register-user', pathMatch: 'full'},
  { path: 'dashboard', redirectTo: '/dashboard', pathMatch: 'full',},
  { path: 'forgot-password', redirectTo: '/forgot-password', pathMatch: 'full'},
  { path: 'verify-email-address', redirectTo: '/verify-email-address', pathMatch: 'full'},
  { path: 'signin', component: SignInUserComponent},
  { path: 'sign-in', component: SignInUserComponent},
  { path: 'register-user', component: SignUpUserComponent},
  { path: 'dashboard',
    loadChildren: ()=> import('./components/dashboard/dashboard.module').then(dashModule => dashModule.DashboardModule),
    canActivate: [AuthGuard]
  },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify-email-address', component: VerifyEmailComponent }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [
  SignInUserComponent,
  SignUpUserComponent,
  ForgotPasswordComponent,
  VerifyEmailComponent
]
