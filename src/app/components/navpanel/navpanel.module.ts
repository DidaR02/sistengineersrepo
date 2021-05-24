import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//import { AppRoutingModule } from './app-routing.module';
import { NavBarComponent } from '../navbar/navbar.component';

@NgModule({
  declarations: [
    NavBarComponent
  ],
  imports: [
    BrowserModule,
    //AppRoutingModule
  ],
  exports:[
    NavBarComponent
  ],
  providers: [],
  bootstrap: [NavBarComponent]
})
export class NavBarModule { }
