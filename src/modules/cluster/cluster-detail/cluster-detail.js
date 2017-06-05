(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterDetailController", clusterDetailController);

    /*@ngInject*/
    function clusterDetailController($state, $stateParams, utils, $scope, $rootScope, dashboardStore, $interval, eventStore, config) {

        var vm = this,
            clusterDetailTimer,
            alerts;


        vm.setTab = setTab;
        vm.isTabSet = isTabSet;
        vm.isDataLoading = true;

        init();
        /* Adding clusterId in scope so that it will be accessible inside child directive */
        function init() {
            $scope.clusterId = $stateParams.clusterId;
            if (!$rootScope.clusterData) {
                utils.getObjectList("Cluster")
                    .then(function(data) {
                        $rootScope.clusterData = data;
                        _setClusterDetail();
                    });
            } else {
                _setClusterDetail();
            }
        }

        function _setClusterDetail() {
            vm.clusterObj = utils.getClusterDetails($scope.clusterId);
            vm.clusterName = vm.clusterObj.cluster_name || "NA";
            vm.clusterStatus = checkStatus(vm.clusterObj);
            if (vm.clusterObj.sds_name === "gluster") {
                _glusterClusterSpecificData($scope.clusterId);
            } else {
                _cephClusterSpecificData($scope.clusterId);
            }

        }

        function checkStatus(clusterObj) {
            var status;
            if (clusterObj.globaldetails.status === "healthy") {
                status = "HEALTH_OK";
            } else if (clusterObj.globaldetails.status === "unhealthy") {
                status = "HEALTH_ERR";
            } else {
                status = clusterObj.globaldetails.status;
            }
            return status;
        }

        function _glusterClusterSpecificData(clusterId) {
            dashboardStore.getClusterDashboardList(clusterId, "cluster")
                .then(function(dashboardData) {
                    $interval.cancel(clusterDetailTimer);
                    vm.clusterData = dashboardData;
                    _makeGlusterTabList();
                    return dashboardStore.getClusterDashboardUtilizationList(clusterId, "cluster", "utilization")
                })
                .then(function(chartData) {
                    vm.chartData = chartData;
                    return eventStore.getAlertList()
                })
                .then(function(alertData) {
                    vm.alerts = dashboardStore.filterAlerts(alertData, "gluster");
                    return dashboardStore.getClusterDashboardUtilizationList(clusterId, "cluster", "cluster_network")
                })
                .then(function(throughput) {
                    vm.throughput = throughput;
                    vm.isDataLoading = false;
                    startTimer();
                });
        }

        function _cephClusterSpecificData(clusterId) {
            dashboardStore.getClusterDashboardList(clusterId, "cluster")
                .then(function(cephDashboardData) {
                    $interval.cancel(clusterDetailTimer);
                    vm.cephCluster = cephDashboardData;
                    _makeCephTabList();
                    return dashboardStore.getClusterDashboardUtilizationList(clusterId, "cluster", "utilization");
                })
                .then(function(cephChartData) {
                    vm.cephChartData = cephChartData;
                    return eventStore.getAlertList()
                })
                .then(function(alertData) {
                    alerts = dashboardStore.filterAlerts(alertData, "ceph");
                    vm.alerts = alerts;
                    return dashboardStore.getClusterDashboardUtilizationList(clusterId, "cluster", "iops");
                })
                .then(function(iopsData) {
                    vm.iops = iopsData;
                    return dashboardStore.getClusterDashboardUtilizationList(clusterId, "cluster", "latency");
                })
                .then(function(latencyData) {
                    vm.latency = latencyData;
                    return dashboardStore.getClusterDashboardUtilizationList(clusterId, "cluster", "cluster_network");
                })
                .then(function(clusterNetworkData) {
                    vm.clusterNetworkData = clusterNetworkData;
                    return dashboardStore.getClusterDashboardUtilizationList(clusterId, "cluster", "public_network");
                })
                .then(function(publicNetworkData) {
                    vm.publicNetworkData = publicNetworkData;
                    vm.isDataLoading = false;
                    startTimer();
                });
        }

        function _makeCephTabList(){
            if(vm.cephCluster) {
                vm.tabList = {
                    "Overview": 1,
                    "Hosts": 2,
                    "Pools": 3,
                    "RBDs": 4
                };
                vm.activeTab = vm.tabList["Overview"];
            } else {
                vm.tabList = {
                    "Hosts": 2,
                    "Pools": 3,
                    "RBDs": 4
                };
                vm.activeTab = vm.tabList["Hosts"];
            }
        }

        function _makeGlusterTabList() {
            if(vm.clusterData) {
                vm.volOverviewData = vm.clusterData.sds_det.volume_status_wise_counts;
                vm.brickOverviewData = vm.clusterData.sds_det.brick_status_wise_counts;
                vm.tabList = {
                    "Overview": 1,
                    "Hosts": 2,
                    "FileShares": 3
                };
                vm.activeTab = vm.tabList["Overview"];
            } else {
                vm.tabList = {
                    "Hosts": 2,
                    "FileShares": 3
                };
                vm.activeTab = vm.tabList["Hosts"];
            }

        }

        function startTimer() {
            clusterDetailTimer = $interval(function() {
                init();
            }, 1000 * config.dashboardIntervalTime, 1);
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(clusterDetailTimer);
        });

        function setTab(newTab) {
            vm.activeTab = newTab;
        }

        function isTabSet(tabNum) {
            return vm.activeTab === tabNum;
        }

    }

})();
