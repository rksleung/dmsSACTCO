jQuery.sap.declare("com.dataworksbi.dmsSACTCO.controller.ModelUtils");
/**
 * @module ModelUtils
 */
/**
 * Model Utils class, used to setup and retrieve models
 * @class ModelUtils
 * @extends sap.ui.base.Object
 */

sap.ui.base.Object.extend("com.dataworksbi.dmsSACTCO.controller.ModelUtils", {
	constructor: function () {},
	/**
	 * Given two integers, <code>a</code> and <code>b</code>,
	 * returns 0 if they are equal, a positive integer if a is greater or negative if b is greater
	 * 
	 * @method compareIntegers
	 * @param {object} a A parseable integer to compare
	 * @param {object} b A parseable integer to compare
	 * @return {Integer} the difference between the two parameters
	 */
	compareIntegers: function (a, b) {
		return parseInt(a || 0, 10) - parseInt(b || 0, 10);
	},
	/**
	 * Gets an existing model. If a new model is to be created with a name which is already used, the clear flag can be set. 
	 * If it is a completely new model, will create and return it.
	 * @method getModel
	 * @param oModel - model to set
	 * @param clear - Flag used to destroy an existing model and recreate it
	 * @param fModel - Optional template
	 * @return {Object} The requested model
	 * @public
	 */
	getModel: function (modelName, clear, fModel) {
		var oModel = sap.ui.getCore().getModel(modelName);
		if (!oModel || clear) {
			if (oModel && clear) {
				oModel.destroy();
			}
			if (fModel) {
				oModel = new sap.ui.model.json.JSONModel(fModel);
			} else {
				oModel = new sap.ui.model.json.JSONModel();
			}
			sap.ui.getCore().setModel(oModel, modelName);
		}
		return oModel;
	},
	setModel: function (model, modelName) {
		sap.ui.getCore().setModel(model, modelName);
	},
	
	getResourceModel: function () {
		return this.getModel("i18n");
	},
	setResourceModel: function (oModel) {
		this.setModel(oModel, "i18n");
	},
	
	/**
	 * Returns a model that stores column-related information. A new model will be created if an old one does not exist. Note that the model may not have data when retrieved
	 * @method getHelpContentModel
	 * @param {String} path
	 * @return existing model, or newly created one if an older one did not exist
	 */

	getTCOChartData: function () {
		return this.getModel("tcoChartData");
	},
	setTCOChartData: function (oModel) {
		this.setModel(oModel, "tcoChartData");
	},
});