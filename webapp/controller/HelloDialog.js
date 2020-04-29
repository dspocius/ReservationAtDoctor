sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel"
], function (Object, JSONModel) {
	"use strict";

	return Object.extend("sap.ui.demo.wt.controller.HelloDialog", {

		_getDialog: function () {
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("sap.ui.demo.wt.view.HelloDialog", this);
			}
			return this._oDialog;
		},

		open: function (oView, oModel) {

			var oDialog = this._getDialog();

			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);
			oView.setModel(oModel, "dialog");

			// open dialog
			oDialog.open();
		},

		onCloseDialog: function () {
			this._getDialog().close();
		}
	});

});
