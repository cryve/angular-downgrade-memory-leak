import {downgradeComponent, getAngularJSGlobal} from '@angular/upgrade/static';
import {AppComponent} from './app.component';

getAngularJSGlobal()
  .module('myApp')
  .directive('demoBootstrap', downgradeComponent({
    component: AppComponent
  }));

