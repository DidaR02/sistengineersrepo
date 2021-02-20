import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FileService } from './service/file.service';

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';

import { environment } from '../environments/environment';
import { FileExplorerModule } from './components/file-explorer/file-explorer.module';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule} from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule} from '@angular/material/paginator';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule} from '@angular/fire/firestore';
import { AngularFireStorageModule} from '@angular/fire/storage';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth'

import { DropzoneDirective } from './dropzone.directive';

import { UploadTaskComponent } from './upload-task/upload-task.component';
import { UploaderComponent } from './components/uploader/uploader.component';
import { UploadComponent } from './service/upload';
import { FileTableModule } from './components/file-table/file-table.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from './service/authentication.service';
import { RenameDialogModule } from './components/rename-dialog/rename-dialog.module';
import { NewFolderDialogModule } from './components/new-folder-dialog/new-folder-dialog.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    DropzoneDirective,
    UploadTaskComponent,
    UploaderComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FileExplorerModule,
    FileTableModule,
    MatDialogModule,
    FlexLayoutModule,
    MatCardModule,
    MatTableModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    RenameDialogModule,
    NewFolderDialogModule,
    BrowserAnimationsModule
  ],
  providers: [
    AuthenticationService,
    UploadComponent,
    FileService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
