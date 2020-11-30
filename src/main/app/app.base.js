(function (angular) {
  'use strict';

  // Declare app level module which depends on views, and core components
  angular.module('myApp', [
    'commons.templates',
    'ui.router',
    'ui.router.upgrade'
  ]).config(configureRouteProvider);

  function configureRouteProvider($stateProvider) {
    $stateProvider.state('main', {
      url: '',
      templateUrl: 'app/layout/layout.main.html',
      controller: 'LayoutMainController',
      controllerAs: '$ctrl',
    });
  }
})(angular);
