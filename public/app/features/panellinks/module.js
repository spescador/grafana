define([
  'angular',
  'lodash',
  './linkSrv',
],
function (angular, _) {
  'use strict';

  angular
    .module('grafana.directives')
    .directive('panelLinksEditor', function() {
      return {
        scope: {
          panel: "="
        },
        restrict: 'E',
        controller: 'PanelLinksEditorCtrl',
        templateUrl: 'public/app/features/panellinks/module.html',
        link: function() {
        }
      };
    }).controller('PanelLinksEditorCtrl', function($scope, backendSrv, dashboardSrv) {

      $scope.panel.links = $scope.panel.links || [];

      $scope.addLink = function() {
        $scope.panel.links.push({
          type: 'dashboard',
        });
      };

      $scope.searchDashboards = function(queryStr, callback) {
        dashboardSrv.searchDashboards(queryStr, callback);
      };

      $scope.dashboardChanged = function(link) {
        backendSrv.search({query: link.dashboard}).then(function(hits) {
          var dashboard = _.find(hits, {title: link.dashboard});
          if (dashboard) {
            link.dashUri = dashboard.uri;
            link.title = dashboard.title;
          }
        });
      };

      $scope.deleteLink = function(link) {
        $scope.panel.links = _.without($scope.panel.links, link);
      };
    });
});
