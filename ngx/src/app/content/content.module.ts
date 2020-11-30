import {NgModule} from '@angular/core';
import './content.component.downgrade';
import {ContentComponent} from './content.component';

/**
 * Module that contains a component used to display the "About COYO" modal.
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
