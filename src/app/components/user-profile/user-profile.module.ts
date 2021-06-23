import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserProfileRoutingModule } from './user-profile-routing.module'
import { UserProfileComponent } from './user-profile.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { UserListComponent } from '../user-list/user-list.component';

@NgModule({
  declarations: [UserProfileComponent, UserListComponent],
  providers: [],
  imports: [
    UserProfileRoutingModule,
    CommonModule,
    MatToolbarModule,
    FlexLayoutModule,
    MatIconModule,
    MatGridListModule,
    MatMenuModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    // NgbModule,
    ReactiveFormsModule,
    MatCheckboxModule
  ],
  exports: [
    UserProfileComponent,
    UserListComponent
  ],
  entryComponents: [],
  bootstrap: [UserProfileComponent, UserListComponent]
})
export class UserProfileModule { }
