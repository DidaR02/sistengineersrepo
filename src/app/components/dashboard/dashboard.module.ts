import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms'; // Reactive form services
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DashboardRoutingModule } from './dashboard-routing.module'
import { DashboardComponent } from './dashboard.component';
import { TableSortableModule } from '../table-sortable/table-sortable.module';
import { UserProfileModule } from '../user-profile/user-profile.module';

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
    TableSortableModule,
    UserProfileModule
  ],
  bootstrap: [DashboardComponent],
  exports: [],
  providers: [],
  entryComponents: []
})
export class DashboardModule { }
