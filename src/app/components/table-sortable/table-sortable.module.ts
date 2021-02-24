import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TableSortableRoutingModule } from './table-sortable-routing.module'
import { NgbdSortableHeader, TableSortableComponent } from './table-sortable.component';
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

@NgModule({
  declarations: [NgbdSortableHeader, TableSortableComponent], 
  providers: [ UploadComponent, FileService],
  imports: [
    TableSortableRoutingModule,
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
    NgbModule,
    ReactiveFormsModule,
    MatCheckboxModule
  ],
  exports: [
    TableSortableComponent
  ],
  entryComponents: [],
  bootstrap: [TableSortableComponent, NgbdSortableHeader]
})
export class TableSortableModule { }
