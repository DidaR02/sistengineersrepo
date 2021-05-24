import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//import { AppRoutingModule } from './app-routing.module';
import { ButtonComponent } from '../button/button.component';

@NgModule({
  declarations: [
    ButtonComponent
  ],
  imports: [
    BrowserModule,
    //AppRoutingModule
  ],
  exports:[
    ButtonComponent
  ],
  providers: [],
  bootstrap: [ButtonComponent]
})
export class NavBarModule { }
