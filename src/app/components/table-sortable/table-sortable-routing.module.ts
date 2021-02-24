import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/service/guard/auth.guard';
import { TableSortableComponent } from './table-sortable.component';

const routes: Routes = [
  {
    path: '', component: TableSortableComponent, canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TableSortableRoutingModule { }
