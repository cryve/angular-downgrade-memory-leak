/* tslint:disable:ordered-imports */

// this must be imported first
import '../../build/cli/src/main/app';

import {enableProdMode, StaticProvider} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {downgradeModule, getAngularJSGlobal} from '@angular/upgrade/static';
import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

if (environment.production) {
  enableProdMode();
}


/*
 * Downgrade Angular application.
 */
getAngularJSGlobal().module('ng-upgrade', [
  'myApp',
  downgradeModule((extraProviders: StaticProvider[]) => {
    const platformRef = platformBrowserDynamic(extraProviders);
    (window as any).ngPlatform = platformRef;
    return platformRef.bootstrapModule(AppModule, {
      // https://github.com/angular/angular/issues/21049
      preserveWhitespaces: true
    });
  })
]);

/*
 * Manually bootstrap AngularJS application.
 */
console.log('Running in browser, starting Hybrid Demo now.');
getAngularJSGlobal().bootstrap(document.body, ['ng-upgrade'], {strictDi: true});
