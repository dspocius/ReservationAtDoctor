sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demo/wt/model/Validator",
	"sap/m/MessageToast"
], function (Controller, JSONModel, Validator, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.demo.wt.controller.FormReservation", {
		onInit: function () {
			sap.ui.getCore().attachValidationError(function (oEvent) {
				oEvent.getParameter("element").setValueState(sap.ui.core.ValueState.Error);
			});

			sap.ui.getCore().attachValidationSuccess(function (oEvent) {
				oEvent.getParameter("element").setValueState(sap.ui.core.ValueState.None);
			});
			
			this.getView().setModel(this.getEmptyModel());
			this.byId("reservationDate").setMinDate(new Date());
		},
		getEmptyModel: function() {
			return new JSONModel({
				firstname: "",
				lastname: "",
				reservationDate: "",
				reservationTime: ""
			});
		},
		timeInputValidation:function(oEvent) {
			var newValue = oEvent.getParameter("newValue");
			var oSource = oEvent.getSource();
			
			this.validateTimeValue(newValue, oSource);
		},
		validateTimeValue: function(newValue, elem) {
			var showError = false;
			
			if (newValue == "") {
				showError = true;
			}else{
				// Workaround for checking time (as I did not found setting between hours frame setting in TimePicker)
				var checkTime = newValue.split(":");
				// Hour:Minutes - so should be only two values
				if (checkTime.length == 2) {
					var hour = parseInt(checkTime[0]);
					// Assume that: From 8 to 17 hour working
					if (!(hour > 7 && hour < 17)) {
						showError = true;
					}
				}else{
					showError = true;
				}
			}
			
			if (showError) {
				elem.setValueState(sap.ui.core.ValueState.Error);
				elem.setValueStateText("Select time between 8 and 17 hours");
			}
			
			return showError;
		},
		dateInputValidation: function(oEvent) {
			var newValue = oEvent.getParameter("newValue");
			var oSource = oEvent.getSource();
			
			var showError = this.validateDateValue(newValue, oSource);
		},
		validateDateValue: function(newValue, elem) {
			var showError = false;
			
			if (newValue == "") {
				showError = true;
			}else{
				// Workaround for checking date - as you can type manually date
				var checkTime = newValue.split("-");
				// Hour:Minutes - so should be only two values
				if (checkTime.length == 3) {
					var year = parseInt(checkTime[0]);
					var month = parseInt(checkTime[1]);
					var day = parseInt(checkTime[2]);
					
					var todayDate = this.getTodayTime();
					
					if (todayDate.year <= year) {
						if (todayDate.month > month) {
							showError = true;
						}else{
							//If it is same month - but day is less than today - show error
							if (todayDate.month == month && todayDate.day > day) {
								showError = true;
							}
						}
					}else{
						showError = true;
					}
				}else{
					showError = true;
				}
			}
			
			if (showError) {
				elem.setValueState(sap.ui.core.ValueState.Error);
				elem.setValueStateText("Select today or future days");		
			}
			
			return showError;
		},
		getTodayTime: function() {
			var today = new Date();
			var dd = today.getDate();
			var MM = today.getMonth() + 1;
			var yyyy = today.getFullYear();
			
			return { day: dd, month: MM, year: yyyy };
		},
		create:function() {
			var oModel = this.getView().getModel();
			var oData = oModel.getData();
			
			var validateDate = this.byId("reservationDate");
			var validateTime = this.byId("reservationTime");
			// Validate date and time fields
			var checkErrorOnDate = this.validateDateValue(oData.reservationDate, validateDate);
			var checkErrorOnTime = this.validateTimeValue(oData.reservationTime, validateTime);

          	var validator = new Validator();
            // Validate input fields
          	validator.validate(this.byId("FormReservation"));

			if (validator._isValid && !checkErrorOnDate && !checkErrorOnTime) {
				var firstname = oData.firstname;
				var lastname = oData.lastname;
				var reservationDate = oData.reservationDate;
				var reservationTime = oData.reservationTime;
				console.log("WF", oModel);
/*
This looks like working with SAP backend
var oModell = new sap.ui.model.odata.ODataModel("/data");
oModell.create('/EntitySet', oData, null, function(){
    console.log("OK");
    },function(){
      sap.ui.commons.MessageBox.alert("Error!");
});*/
				var self = this;
				
				$.ajax({
					url : "http://localhost:3002/reservation",
					contentType : 'application/json',
					data: JSON.stringify(oData),
					type : 'POST'
				})
				.done(function(msg){
					self.getOwnerComponent().helloDialog.open(self.getView(), oModel);
					self.getView().setModel(self.getEmptyModel());
				})
				.fail(function(xhr, status, error, dat) {
					MessageToast.show("Appointment time is taken or you already registered this week", {
						duration: 1000
					});
					self.showColor('#cc1919');
				});
			}
		},
		showColor: function(color) {
		  var oContentDOM = $('#content'); //Pass div Content ID
		  var oParent = $('#content').parent(); //Get Parent
		  //Find for MessageToast class
		  var oMessageToastDOM = $('#content').parent().find('.sapMMessageToast');
		  oMessageToastDOM.css('background', color);
		},
		showCalendar: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("calendar");
		}
	});

});
