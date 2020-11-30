(function (angular) {
  'use strict';

  angular
      .module('myApp')
      .controller('LayoutMainController', LayoutMainController);

  function LayoutMainController() {
    var vm = this;
    vm.show = false;
    vm.expandToggle = expandToggle;

    function expandToggle() {
      vm.show = !vm.show;
    }
  }

})(angular);
