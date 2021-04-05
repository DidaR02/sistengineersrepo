import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TableSortableComponent } from './table-sortable.component';

const routes: Routes = [
  {
    path: '', component: TableSortableComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TableSortableRoutingModule { }
