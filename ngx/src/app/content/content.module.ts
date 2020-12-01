import {NgModule} from '@angular/core';
import './content.component.downgrade';
import {ContentComponent} from './content.component';

/**
 * Module that contains a simple downgraded component which can be used in AngularJS templates.
 */
@NgModule({
  declarations: [
    ContentComponent
  ],
  entryComponents: [
    ContentComponent
  ]
})
export class ContentModule {
}
