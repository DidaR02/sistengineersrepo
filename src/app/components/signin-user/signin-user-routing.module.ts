import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/service/guard/auth.guard';
import { SignInUserComponent } from './signin-user.component';

const routes: Routes = [
  {
    path: '', component: SignInUserComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SigninRoutingModule { }
