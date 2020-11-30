import {downgradeComponent, getAngularJSGlobal} from '@angular/upgrade/static';
import {ContentComponent} from './content.component';

getAngularJSGlobal()
  .module('commons.templates')
  .directive('contentNgx', downgradeComponent({
    component: ContentComponent
  }));

