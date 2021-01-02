sap.ui.define([
  "com/dataworksbi/dmsSACTCO/controller/BaseController",
  "com/dataworksbi/dmsSACTCO/controller/ModelUtils"
], function(Controller, ModelUtils) {
  "use strict";

  return Controller.extend("com.dataworksbi.dmsSACTCO.controller.MainView", {
    modelUtils: new ModelUtils(),

    onInit: function () {
      var tcoChartModel = this.modelUtils.getTCOChartData();
      tcoChartModel.loadData("model/financials.json", "", false);
			this.getView().setModel(tcoChartModel, "TCOData");      
    }
  });
});
