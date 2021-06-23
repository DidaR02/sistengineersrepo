import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FileService } from './service/fileService/file.service';

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

import { DropzoneDirective } from './service/fileService/dropzone.directive';

import { UploadTaskComponent } from './components/upload-task/upload-task.component';
import { UploaderComponent } from './components/uploader/uploader.component';
import { UploadComponent } from './service/fileService/upload';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from 'src/app/service/authentication/authentication.service';
import { RenameDialogModule } from './components/rename-dialog/rename-dialog.module';
import { NewFolderDialogModule } from './components/new-folder-dialog/new-folder-dialog.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbAlertComponent } from './components/ngb-alert/ngb-alert.component';
import { CommonModule } from '@angular/common';
import { ShareDialogModule } from './components/share-dialog/share-dialog.module';
import { HttpClientModule } from "@angular/common/http";
import { IconService } from './service/iconService/icon.service';
import { APP_INITIALIZER } from '@angular/core';
import { FileManagerService } from './service/shared/files-manager.service';

@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    DropzoneDirective,
    UploadTaskComponent,
    UploaderComponent,
    NgbAlertComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    FileExplorerModule,
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
    // NgbModule,
    FormsModule,
    ReactiveFormsModule,
    RenameDialogModule,
    NewFolderDialogModule,
    BrowserAnimationsModule,
    ShareDialogModule,
    HttpClientModule
  ],
  providers: [
    AuthenticationService,
    UploadComponent,
    FileService,
    {
      provide: APP_INITIALIZER,
      useFactory: initIconService,
      deps: [IconService],
      multi: true
    },
    FileManagerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function initIconService(iconService: IconService) {
  return () => iconService.init();
}
