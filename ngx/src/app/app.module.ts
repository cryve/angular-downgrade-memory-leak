import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {UIRouterUpgradeModule} from '@uirouter/angular-hybrid';
import {ContentModule} from './content/content.module';

export const uiRouterModule = UIRouterUpgradeModule.forRoot();

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    ContentModule,
    uiRouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
