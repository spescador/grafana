///<reference path="../../../../headers/common.d.ts" />

import {describe, beforeEach, it, sinon, expect, angularMocks} from '../../../../../test/lib/common';

import {ThresholdManager} from '../threshold_manager';
import $ from 'jquery';
import TimeSeries from 'app/core/time_series2';

describe('ThresholdManager', function() {

  function plotOptionsScenario(desc, func)  {
    describe(desc, function() {
      var ctx: any = {
        panel: {
          thresholds: [],
        },
        data: [],
        options: {
          grid: {markings: []},
        },
        panelCtrl: {},
      };
     ctx.data.push(new TimeSeries({
        datapoints: [[2000,1],[0.002,2],[0,3],[-1,4]],
        alias: 'series1'
      }));
     var manager = new ThresholdManager(ctx.panelCtrl);
      ctx.setup = function(thresholds) {
        ctx.panel.thresholds = thresholds;
        var manager = new ThresholdManager(ctx.panelCtrl);
        manager.addFlotOptions(ctx.options, ctx.panel);
      };

      var plot = $.plot("<div style=\"width: 500px; height: 200px;\" grafana-graph=\"\" class=\"ng-scope\"><div></div></div>, length: 1'",
      ctx.data, ctx.options);
      var axes = plot.getAxes();
      var offset = plot.getPlotOffset();

      func(ctx, plot, manager);
    });
  }

  describe("When creating plot markings", () => {
    plotOptionsScenario("setup threshold object", (ctx, plot, manager) => {
      ctx.setup([
        ctx.panel.thresholds = {value: 2, colorMode: "critical", op: 'gt', fill: false, line: false, points: true},
      ]);

      it('ensure data points are marked on canvas', function() {
        var axes = plot.getAxes();
        var offset = plot.getPlotOffset();
        // get the first (and only) series
        var series = ctx.data;
        var dp = series[0].datapoints;

        for (var i = 0; i < dp.length; i++) {
          var datapoint = dp[i];
          var value = datapoint[1];

          var x = offset.left + axes.xaxis.p2c(datapoint[0]);
          var y = offset.top + axes.yaxis.p2c(datapoint[1]);

          var cavas = plot.getCanvas();
          var cavasCxt = cavas.getContext("2d");

          manager.drawThresholdDataPoint(x,y, ctx.panel.thresholds, 5, cavasCxt);
          // ensure the previous method drew a point in the specified location
          expect(cavasCxt.isPointInPath(x,y)).to.be(true);
        }
      });
    });

    plotOptionsScenario("for simple gt threshold", ctx => {
      ctx.setup([
        {op: 'gt', value: 300, fill: true, line: true, colorMode: 'critical'},
      ]);

      it('should add fill for threshold with fill: true', function() {
        var markings = ctx.options.grid.markings;

        expect(markings[0].yaxis.from).to.be(300);
        expect(markings[0].yaxis.to).to.be(Infinity);
        expect(markings[0].color).to.be('rgba(234, 112, 112, 0.12)');
      });

      it('should add line', function() {
        var markings = ctx.options.grid.markings;
        expect(markings[1].yaxis.from).to.be(300);
        expect(markings[1].yaxis.to).to.be(300);
        expect(markings[1].color).to.be('rgba(237, 46, 24, 0.60)');
      });
    });

    plotOptionsScenario("for two gt thresholds", ctx => {
      ctx.setup([
        {op: 'gt', value: 200, fill: true, colorMode: 'warning'},
        {op: 'gt', value: 300, fill: true, colorMode: 'critical'},
      ]);

     it('should add fill for first thresholds to next threshold', function() {
         var markings = ctx.options.grid.markings;
         expect(markings[0].yaxis.from).to.be(200);
         expect(markings[0].yaxis.to).to.be(300);
     });

     it('should add fill for last thresholds to infinity', function() {
       var markings = ctx.options.grid.markings;
       expect(markings[1].yaxis.from).to.be(300);
       expect(markings[1].yaxis.to).to.be(Infinity);
     });

    });

    plotOptionsScenario("for lt then gt threshold (inside)", ctx => {
      ctx.setup([
        {op: 'lt', value: 300, fill: true, colorMode: 'critical'},
        {op: 'gt', value: 200, fill: true, colorMode: 'critical'},
      ]);

     it('should add fill for first thresholds to next threshold', function() {
         var markings = ctx.options.grid.markings;
         expect(markings[0].yaxis.from).to.be(300);
         expect(markings[0].yaxis.to).to.be(200);
     });

     it('should add fill for last thresholds to itself', function() {
       var markings = ctx.options.grid.markings;
       expect(markings[1].yaxis.from).to.be(200);
       expect(markings[1].yaxis.to).to.be(200);
     });

    });

    plotOptionsScenario("for gt then lt threshold (outside)", ctx => {
      ctx.setup([
        {op: 'gt', value: 300, fill: true, colorMode: 'critical'},
        {op: 'lt', value: 200, fill: true, colorMode: 'critical'},
      ]);

     it('should add fill for first thresholds to next threshold', function() {
         var markings = ctx.options.grid.markings;
         expect(markings[0].yaxis.from).to.be(300);
         expect(markings[0].yaxis.to).to.be(Infinity);
     });

     it('should add fill for last thresholds to itself', function() {
       var markings = ctx.options.grid.markings;
       expect(markings[1].yaxis.from).to.be(200);
       expect(markings[1].yaxis.to).to.be(-Infinity);
     });

    });

    });
  });
