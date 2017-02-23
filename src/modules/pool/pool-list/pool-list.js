(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("poolController", poolController);

    /*@ngInject*/
    function poolController($scope, $rootScope, $state, $interval, config, utils) {
        var vm = this,
            key,
            len,
            poolList = [],
            pool,
            list,
            i,
            timer,
            clusterObj;

        vm.createPool = createPool;

        init();

        function init() {
            list = utils.getPoolDetails($scope.clusterId);
            _createPoolList(list);
        }

        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function (event, data) {
            /* Forward to home view if we don't have any cluster */    
            if($rootScope.clusterData === null || $rootScope.clusterData.clusters.length === 0){
                $state.go("home");
            }else {
                init();
            }
        });

        /*Refreshing list after each 30 second interval*/
        timer = $interval(function () {

            utils.getObjectList("Cluster")
                .then(function(data) {
                    $rootScope.clusterData = data;
                    init();
                });

        }, 1000 * config.refreshIntervalTime );

        /*Cancelling interval when scope is destroy*/
        $scope.$on('$destroy', function() {
            $interval.cancel(timer);
        });


        function _createPoolList(list) {

            len = list.length;
            poolList = [];

            for ( i = 0; i < len; i++) {
                pool = {};
                clusterObj = {};
                pool.clusterName = "Unassigned";
                pool.name = list[i].pool_name;
                pool.clusterId = list[i].cluster_id;
                pool.pgCount = list[i].pg_num;
                clusterObj = utils.getClusterDetails(list[i].cluster_id);
                if(typeof clusterObj !== "undefined") {
                    pool.clusterName = clusterObj.name;
                }
                pool.status = "NA";
                pool.type = list[i].type;
                pool.utilization = {"percent_used": list[i].percent_used };
                pool.replicaCount = list[i].size ? list[i].size : "NA";
                pool.osdCount = "NA";
                pool.quotas = "NA";
                if(list[i].quota_enabled){
                    if(list[i].quota_enabled.toLowerCase() === "false") {
                        pool.quotas = "Disabled";
                    } else if(list[i].quota_enabled.toLowerCase() === "true") {
                        pool.quotas = list[i].quota_max_objects;
                    }
                }
                pool.alertCount = "NA";
                
                poolList.push(pool);
                
            }
            vm.poolList = poolList;
        }

        function createPool() {
            $state.go("create-pool");
        }
    }

})();