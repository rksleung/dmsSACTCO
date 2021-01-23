sap.ui.define([
  "com/dataworksbi/dmsSACTCO/controller/BaseController",
  "com/dataworksbi/dmsSACTCO/controller/ModelUtils",
  "sap/viz/ui5/format/ChartFormatter",
  "sap/viz/ui5/api/env/Format"
], function(Controller, ModelUtils, ChartFormatter, Format) {
  "use strict";

  return Controller.extend("com.dataworksbi.dmsSACTCO.controller.MainView", {
    modelUtils: new ModelUtils(),

		_setCustomFormatter: function () {
			var chartFormatter = ChartFormatter.getInstance();
			Format.numericFormatter(chartFormatter);
			var UI5_FLOAT_FORMAT = "CustomFloatFormat_F2";
			chartFormatter.registerCustomFormatter(UI5_FLOAT_FORMAT, function (value) {
				var ofloatInstance = sap.ui.core.format.NumberFormat.getFloatInstance({
					style: 'short',
					maxFractionDigits: 2
				});
				return ofloatInstance.format(value);
      });
			var UI5_AXIS_FLOAT_FORMAT = "CustomAxisFloatFormat";
			chartFormatter.registerCustomFormatter(UI5_AXIS_FLOAT_FORMAT, function (value) {
				var ofloatInstance = sap.ui.core.format.NumberFormat.getCurrencyInstance({isoCode: 'USD', decimals: 0});
				return ofloatInstance.format(value);
      });
    },
        
    onInit: function () {
      var tcoChartModel = this.modelUtils.getTCOChartData();
      tcoChartModel.loadData("model/financials.json", "", false);
      let d = tcoChartModel.getData();
      d.calculation = d.financials.map( v => { 
        return Object.assign({}, v);
      });
      this.getView().setModel(tcoChartModel, "TCOData");
      this._setCustomFormatter();      
      this.calculateTCO();
    },

    refreshValue: function () {
      var tcoChartModel = this.getView().getModel("TCOData");
      let d = tcoChartModel.getData();
      this.calculateTCO();
      if (!d.op1) {
        d.calculation[0].Acquisition = 0;
        d.calculation[1].Acquisition = 0;
      }
      if (!d.op2) {
        d.calculation[0].Implementation = 0;
        d.calculation[1].Implementation = 0;
      }
      if (!d.op3) {
        d.calculation[0].Production = 0;
        d.calculation[1].Production = 0;
      }
      if (!d.op4) {
        d.calculation[0].EndUser = 0;
        d.calculation[1].EndUser = 0;
      }
      //tcoChartModel.setData(d);
      this.getView().getModel("TCOData").refresh(true);
    },

    onChange: function () {
      this.calculateTCO();
      this.getView().getModel("TCOData").refresh(true);
    },

    calculateTCO: function () {
      var tcoChartModel = this.getView().getModel("TCOData");
      let d = tcoChartModel.getData();
      let avgLicenseCost = d.Assumptions.OnPremLicenseCost;
      let totalSeats = d.Assumptions.TotalSeats;
      let numOfYear = d.Assumptions.NumOfYear;
      if (totalSeats > 800) {
        avgLicenseCost = avgLicenseCost * 0.7;
      } else if (totalSeats > 500) {
        avgLicenseCost = avgLicenseCost * 0.8;
      } else if (totalSeats > 200) {
        avgLicenseCost = avgLicenseCost * 0.9;
      }
      let avgSACCostByMonth = 36;
      if (totalSeats > 1001) {
        avgSACCostByMonth = 17;
      } else if (totalSeats > 500) {
        avgSACCostByMonth = 19;
      } else if (totalSeats > 200) {
        avgSACCostByMonth = 21;
      } else if (totalSeats > 25) {
        avgSACCostByMonth = 24;
      }
      let avgSACCost = avgSACCostByMonth * 12;

      let onPrem = d.calculation[0];
      let sac = d.calculation[1];
      let as = d.Assumptions;
      let r_onPrem = d.waterfall1;
      let r_sac = d.waterfall2;
      onPrem.AcquisitionPart = Array(numOfYear).fill(0);
      r_onPrem.recurring = Array(numOfYear).fill(0);
      onPrem.AcquisitionPart = onPrem.AcquisitionPart.map( (a, index) => {
        let val = index == 0 ? avgLicenseCost * totalSeats : 0;
        val += avgLicenseCost * totalSeats * as.AnnualSoftwareMaint / 100;
        val += as.AvgHardwareCost * totalSeats * as.AnnualHardwareMaint / 100;
        val += index == 0 ? as.AvgEffortPerEvaluationIT / as.WorkDayPerYear * as.AvgITStaffInvolvedEvaluation * as.AvgSalaryIT : 0;
        val += index == 0 ? as.AvgEffortPerEvalutaionBusUser / as.WorkDayPerYear * as.AvgBusUserInvolvedEvaluation * as.AvgSalaryEndUser : 0;
        return val;
      });
      r_onPrem.recurring = r_onPrem.recurring.map( (a, index) => {
        let val = avgLicenseCost * totalSeats * as.AnnualSoftwareMaint / 100;
        val += as.AvgHardwareCost * totalSeats * as.AnnualHardwareMaint / 100;
        return val;
      });
      sac.AcquisitionPart = Array(numOfYear).fill(avgSACCost * totalSeats);
      r_sac.recurring = Array(numOfYear).fill(avgSACCost * totalSeats);
      sac.AcquisitionPart = sac.AcquisitionPart.map( (a, index) => {
        let val = a;
        val += index == 0 ? as.AvgEffortPerEvaluationIT / as.WorkDayPerYear * as.AvgITStaffInvolvedEvaluation * as.AvgSalaryIT : 0;
        val += index == 0 ? as.AvgEffortPerEvalutaionBusUser / as.WorkDayPerYear * as.AvgBusUserInvolvedEvaluation * as.AvgSalaryEndUser : 0;
        return val;
      });
      onPrem.AcquisitionPart = onPrem.AcquisitionPart.map( (a, index) => {
        return index == 0 ? a : a / Math.pow(1 + as.Discount/100, index);
      });
      sac.AcquisitionPart = sac.AcquisitionPart.map( (a, index) => {
        return index == 0 ? a : a / Math.pow(1 + as.Discount/100, index);
      });
      const reducer = (accumulator, currentValue) => accumulator + currentValue;
      onPrem.Acquisition = onPrem.AcquisitionPart.reduce(reducer);
      sac.Acquisition = sac.AcquisitionPart.reduce(reducer);

      onPrem.Implementation = as.AvgLenDeployment * as.AvgBillRate * 8;
      onPrem.Implementation += as.AvgTrainingFeesTech * as.PercentOfAdvancedUsers / 100 * totalSeats;
      onPrem.Implementation += as.AvgTrainingFeesGen * as.PercentOfNormalUsers / 100 * totalSeats;
      sac.Implementation = as.AvgLenSACDeployment * as.AvgBillRate * 8;
      sac.Implementation += as.AvgTrainingFeesTech * as.PercentOfAdvancedUsers / 100 * totalSeats;
      sac.Implementation += as.AvgTrainingFeesGen * as.PercentOfNormalUsers / 100 * totalSeats / 2;
      
      onPrem.ProductionPart = Array(numOfYear).fill(0);
      onPrem.ProductionPart = onPrem.ProductionPart.map( (a, index) => {
        let val = 0;  
        val += as.ServerMaintenanceFTE * as.AvgSalaryIT * 1.2;
        val += as.PercentOfReportChangesPerMonth /100 * totalSeats / 7 * 12 * as.AvgSalaryIT / as.WorkDayPerYear;
        val += as.PercentOfSecurityRoleChangesPerMonth / 100 * totalSeats / 7 * 12 * as.AvgSalaryIT / as.WorkDayPerYear;
        return val;
      });
      r_onPrem.recurring = r_onPrem.recurring.map( (a, index) => {
        let val = a;  
        val += as.ServerMaintenanceFTE * as.AvgSalaryIT * 1.2;
        val += as.PercentOfReportChangesPerMonth /100 * totalSeats / 7 * 12 * as.AvgSalaryIT / as.WorkDayPerYear;
        val += as.PercentOfSecurityRoleChangesPerMonth / 100 * totalSeats / 7 * 12 * as.AvgSalaryIT / as.WorkDayPerYear;
        return val;
      });
      sac.ProductionPart = Array(numOfYear).fill(as.ProductionSubscriptionSvc * 12 * as.ProductionSubscriptionUnit);
      r_sac.recurring = r_sac.recurring.map( (a, index ) => {
        return a + as.ProductionSubscriptionSvc * 12 * as.ProductionSubscriptionUnit;
      });

      const recurring_map =  (a, index) => {
        let year_name = "Year " + (index + 1);
        return { "category": year_name, "Amount": a, "Type": null };
      };
      let subtotal = r_onPrem.recurring.reduce(reducer);
      d.waterfall1 = r_onPrem.recurring.map(recurring_map);
      d.waterfall1.push( { "category": "Total", "Amount": subtotal, "Type": "subtotal:1"} );
      subtotal = r_sac.recurring.reduce(reducer);
      d.waterfall2 = r_sac.recurring.map(recurring_map);
      d.waterfall2.push( { "category": "Total", "Amount": subtotal, "Type": "subtotal:1"} );
      onPrem.ProductionPart = onPrem.ProductionPart.map( (a, index) => {
        return index == 0 ? a : a / Math.pow(1 + as.Discount/100, index);
      });
      sac.ProductionPart = sac.ProductionPart.map( (a, index) => {
        return index == 0 ? a : a / Math.pow(1 + as.Discount/100, index);
      });
      onPrem.Production = onPrem.ProductionPart.reduce(reducer);
      sac.Production = sac.ProductionPart.reduce(reducer);

      onPrem.EndUserPart = Array(numOfYear).fill(0);
      onPrem.EndUserPart[1] = as.AvgTrainingFeesGen * as.PercentOfNormalUsers / 100 * totalSeats / 2;
      sac.EndUserPart = Array(numOfYear).fill(0);
      sac.EndUserPart[1] = as.AvgTrainingFeesGen * as.PercentOfNormalUsers / 100 * totalSeats / 2;
      onPrem.EndUserPart = onPrem.EndUserPart.map( (a, index) => {
        return index == 0 ? a : a / Math.pow(1 + as.Discount/100, index);
      });
      sac.EndUserPart = sac.EndUserPart.map( (a, index) => {
        return index == 0 ? a : a / Math.pow(1 + as.Discount/100, index);
      });
      onPrem.EndUser = onPrem.EndUserPart.reduce(reducer);
      sac.EndUser = sac.EndUserPart.reduce(reducer);
    }
  });
});
