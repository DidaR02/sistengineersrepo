import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/service/guard/auth.guard';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  {path: '', component: DashboardComponent},
  { path: '', component: DashboardComponent,
    children: [
    {
      path: 'manageFiles',
      loadChildren: ()=> import('../table-sortable/table-sortable.module').then(viewSales => viewSales.TableSortableModule)
    },
    {
      path: 'userProfile',
      loadChildren: ()=> import('../user-profile/user-profile.module').then(viewSales => viewSales.UserProfileModule)
    }],
    canActivateChild: [AuthGuard]}
]
@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }