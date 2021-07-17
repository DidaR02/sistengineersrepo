import { BrowserModule } from '@angular/platform-browser';
import { Directive, NgModule } from '@angular/core';

import { FileService } from './service/fileService/file.service';

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';

import { environment } from '../environments/environment';
import { FileExplorerModule } from './components/file-explorer/file-explorer.module';
// import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';
// import { MatCardModule } from '@angular/material/card';
// import { MatTableModule } from '@angular/material/table';
// import { MatSortModule} from '@angular/material/sort';
// import { MatIconModule } from '@angular/material/icon';
// import { MatPaginatorModule} from '@angular/material/paginator';

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

import {MatMenuModule} from '@angular/material/menu';
import {A11yModule} from '@angular/cdk/a11y';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {PortalModule} from '@angular/cdk/portal';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatBadgeModule} from '@angular/material/badge';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatStepperModule} from '@angular/material/stepper';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatNativeDateModule, MatRippleModule} from '@angular/material/core';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSliderModule} from '@angular/material/slider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTreeModule} from '@angular/material/tree';
import { OverlayModule } from '@angular/cdk/overlay';

@Directive({
  selector:
      'input[type=checkbox][formControlName],input[type=checkbox][formControl],input[type=checkbox][ngModel]',

})
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
    // MatDialogModule,
    FlexLayoutModule,
    // MatCardModule,
    // MatTableModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    // MatSortModule,
    // MatPaginatorModule,
    // MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    RenameDialogModule,
    NewFolderDialogModule,
    BrowserAnimationsModule,
    ShareDialogModule,
    HttpClientModule,
    A11yModule,
    ClipboardModule,
    CdkStepperModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    OverlayModule,
    PortalModule,
    ScrollingModule,
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
