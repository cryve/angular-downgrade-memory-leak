import { Component } from '@angular/core';
import {UIRouter} from '@uirouter/core';
import {UIRouterRx} from '@uirouter/rx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ngx';

  constructor(router: UIRouter) {
    router.plugin(UIRouterRx);
  }
}
