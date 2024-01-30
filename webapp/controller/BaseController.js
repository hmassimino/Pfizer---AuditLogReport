sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/m/library",
	"../model/ODataPromise",
	'sap/ui/core/Fragment',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/library",
	
], function (
	Controller,
	History,
	UIComponent,
	library,
	ODataPromise,
	Fragment,
	Filter,
	FilterOperatory,
	coreLibrary,
	formatter
	) {
	"use strict";

	return Controller.extend("auditlogreport.controller.BaseController", {
		_oResourceBundle: null,
		_busyDialog: null,
	
		onInit: function () {
			//this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},

		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},
		byFragmentId: function(sFragment,sControl) {
			return this.byId(sap.ui.core.Fragment.createId(sFragment,sControl))
		},

		getModel: function (sName) {
			if (sName) {
				return this.getOwnerComponent().getModel(sName);
			} else {
				return this.getOwnerComponent().getModel();
			}
		},

		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		 createOdataPromse: function (oModel) {
			if (this._oData !== undefined)  return 
			this._oData = new ODataPromise(oModel);
		}, 
		
		
	});

});