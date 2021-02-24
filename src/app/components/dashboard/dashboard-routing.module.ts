import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/Service/guard/auth.guard';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  { path: '', component: DashboardComponent,
    children: [
    {
      path: 'manageFiles',
      loadChildren: ()=> import('../table-sortable/table-sortable.module').then(viewSales => viewSales.TableSortableModule)
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