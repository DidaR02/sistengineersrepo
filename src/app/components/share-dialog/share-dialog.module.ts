import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ShareDialogComponent } from './share-dialog.component';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatNativeDateModule, MatRippleModule} from '@angular/material/core';

@NgModule({
  declarations: [ShareDialogComponent], 
  providers: [ ],
  imports: [
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
    ClipboardModule,
    MatButtonToggleModule,
    MatNativeDateModule,
    MatRippleModule
  ],
  exports: [
    ShareDialogComponent
  ],
  entryComponents: [],
  bootstrap: [ShareDialogComponent]
})
export class ShareDialogModule { }
