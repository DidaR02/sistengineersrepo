import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileExplorerComponent } from './file-explorer.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RenameDialogComponent } from '../rename-dialog/rename-dialog.component';
import { NewFolderDialogComponent } from '../new-folder-dialog/new-folder-dialog.component';

import {MatCardModule} from '@angular/material/card';
import { UploadComponent } from 'src/app/service/upload';
import { FileService } from '../../service/file.service';

@NgModule({
  declarations: [FileExplorerComponent], 
  providers: [UploadComponent, FileService],
  imports: [
    CommonModule,
    MatToolbarModule,
    FlexLayoutModule,
    MatIconModule,
    MatGridListModule,
    MatMenuModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    // NgxMatFileInputModule,
    ReactiveFormsModule
  ],
  exports: [
    FileExplorerComponent
  ],
  entryComponents: [],

})
export class FileExplorerModule { }
