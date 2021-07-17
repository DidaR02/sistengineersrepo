import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SigninRoutingModule } from './signin-user-routing.module'
import { SignInUserComponent } from './signin-user.component';
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
import { UploadComponent } from 'src/app/service/fileService/upload';
import { FileService } from '../../service/fileService/file.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [SignInUserComponent],
  providers: [ UploadComponent, FileService],
  imports: [
    SigninRoutingModule,
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
    MatCheckboxModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  exports: [
    SignInUserComponent
  ],
  entryComponents: [],
  bootstrap: [SignInUserComponent]
})
export class TableSortableModule { }
