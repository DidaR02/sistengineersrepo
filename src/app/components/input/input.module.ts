import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//import { AppRoutingModule } from './app-routing.module';
import { InputComponent } from '../input/input.component';

@NgModule({
  declarations: [
    InputComponent
  ],
  imports: [
    BrowserModule,
    //AppRoutingModule
  ],
  exports:[
    InputComponent
  ],
  providers: [],
  bootstrap: [InputComponent]
})
export class NavBarModule { }
