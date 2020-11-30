'use strict';

angular.module('myApp.view1', ['ui.router', 'ui.router.upgrade'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', [function() {

}]);
