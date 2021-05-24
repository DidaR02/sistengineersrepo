import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//import { AppRoutingModule } from './app-routing.module';
import { SelectInputComponent } from './select-input.component';

@NgModule({
  declarations: [
    SelectInputComponent
  ],
  imports: [
    BrowserModule,
    //AppRoutingModule
  ],
  exports:[
    SelectInputComponent
  ],
  providers: [],
  bootstrap: [SelectInputComponent]
})
export class NavBarModule { }
