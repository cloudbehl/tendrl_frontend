(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createClusterModalController", createClusterModalController);

    /*@ngInject*/
    function createClusterModalController($rootScope, $scope, $state) {

        var vm = this,
        clusterState;
        
        vm.valueSelected = "ceph";

        vm.cancelModal = function () {
            $state.go("landing-page");
            $rootScope.$emit('modal.done', 'cancel');
        };

        vm.closeModal = function () {
            $rootScope.$emit('modal.done', 'close');
        };

        vm.createCluster = function() {
            vm.closeModal();
            var clusterState = "create-"+vm.valueSelected+"-cluster";
            $state.go(clusterState);
        };

        vm.setSelected = function(valueSelected) {
           vm.valueSelected = valueSelected;
        };

        vm.modalHeader = {
            "title": "Select Storage Service",
            "close": vm.closeModal
        };

        vm.modalFooter = [{
            "name": "Cancel",
            "classname": "btn-default",
            "onCall": vm.cancelModal
        },{
            "name": "Next",
            "classname": "btn-primary",
            "onCall": vm.createCluster
        }];

        vm.StorageServices = [{
            "name": "Ceph",
            "value": "ceph"
        },{
            "name": "Gluster",
            "value": "gluster"
        }];
    }

})();