import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/Service/guard/auth.guard';
import { FormsModule, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms'; // Reactive form services
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DashboardRoutingModule } from './dashboard-routing.module'
import { DashboardComponent } from './dashboard.component';
import { TableSortableModule } from '../table-sortable/table-sortable.module';

@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    TableSortableModule
  ],
  bootstrap: [DashboardComponent],
  exports: [],
  providers: [],
  entryComponents: []
})
export class DashboardModule { }
