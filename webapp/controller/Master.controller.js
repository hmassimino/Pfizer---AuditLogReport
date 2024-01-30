sap.ui.define([
    "auditlogreport/controller/BaseController",

    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator",
    'sap/ui/core/Fragment',
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, Filter,
        FilterOperator,
        Fragment) {
        "use strict";

        return BaseController.extend("auditlogreport.controller.Master", {
            localModel: null,
            onInit: function () {
                this.i18n = this.getOwnerComponent().getModel("i18n");
                sap.ui.getCore().setModel(this.i18n, "i18n");
                var localModel = this.getModel();
                sap.ui.getCore().setModel(localModel);

                var localModel = this.getModel();
                var oDataModel = this.getModel("oDataModel");

                this.createOdataPromse(oDataModel);


                localModel.setProperty("")

                localModel.setProperty("/ServiceFilter", "")
                localModel.setProperty("/ActionFilter", "")
                localModel.setProperty("/UserFilter", "")
                localModel.setProperty("/ToFilter", "")
                localModel.setProperty("/FromFilter", "")
                

                localModel.setProperty("/Alogs", [])
                this.getInitialData();
                this.onSearch({},true)
            },

            getInitialData: async function () {
                var localModel = this.getModel();
                var resService = await this._oData.read("/ServiceView")
                if (resService && resService.results) {
                    localModel.setProperty("/ServiceCombobox", resService.results)
                }
                
                var resAction = await this._oData.read("/ActionView")
                if (resAction && resAction.results) {
                    localModel.setProperty("/ActionCombobox", resAction.results)
                }
            },

            onSettingsTablePress: async function (oEvent) {
                var localModel = this.getModel();
                var that = this
                var oButton = oEvent.getSource(), oView = this.getView();

                var oTable = this.byId("auditLogTable")

                var columnsOriginals = []
                oTable.getColumns().forEach(col => {
                    columnsOriginals.push({
                        "id": col.sId,
                        "label": col.mAggregations.label.mProperties.text,
                        "active": col.getVisible()

                    })
                });
                localModel.setProperty("/TableColumns", columnsOriginals)
                localModel.updateBindings(true)

                if (!this._pPopoverSettingsTable) {
                    this._pPopoverSettingsTable = Fragment.load({
                        id: oView.getId(),
                        name: "auditlogreport.view.fragments.TableSettings",
                        controller: this
                    }).then(function (oPopover) {
                        oView.addDependent(oPopover);
                        return oPopover;
                    });
                }

                this._pPopoverSettingsTable.then(function (oPopover) {
                    that.byId("idList").removeSelections(true)

                    var items = that.byId("idList").getItems()
                    items.forEach(element => {
                        if (element.getBindingContext().getObject().active) {
                            that.byId("idList").setSelectedItem(element)
                        }
                    });
                    return oPopover;
                })

                this._pPopoverSettingsTable.then(function (oPopover) {
                    oPopover.openBy(oButton);
                });

            },
            onTableSettingsClose: function () {
                if (this._pPopoverSettingsTable) {
                    this._pPopoverSettingsTable.then(function (oPopover) {
                        oPopover.destroy(true)
                        //oPopover = null
                    })
                    this._pPopoverSettingsTable = null
                }
            },
            
            onSelectionTableConfigChange: function (oEvent) {


                var oList = oEvent.getSource();
                var oLabel = this.byId("idFilterLabel");
                var oInfoToolbar = this.byId("idInfoToolbar");
                var localModel = this.getModel();
                var oView = this.getView();

                var aContexts = oList.getSelectedContexts(true);

                var bSelected = (aContexts && aContexts.length > 0);
                var sText = (bSelected) ? aContexts.length + " selected" : null;
                oInfoToolbar.setVisible(bSelected);
                oLabel.setText(sText);


                var columns = this.byId("auditLogTable").getColumns()



                if (aContexts) {


                    var colsSelected = []
                    aContexts.forEach(function (s) {

                        var itemSelected = localModel.getProperty(s.sPath);
                        colsSelected.push(itemSelected)
                    })

                    columns.forEach(function (s) {

                        var found = false
                        colsSelected.forEach(e => {
                            if (e.id === s.sId) {
                                found = true
                            }

                        })

                        s.setVisible(found)

                    });
                }

            },
            onSearch: async function (oEvent,onInitLoad) {
                var localModel = this.getModel();
                var oDataModel = this.getModel("oDataModel")
                var that = this
                var iconTabSelected = this.byId("IconTabLogs").getSelectedKey();
                if(!onInitLoad){
                    var FromFilter = localModel.getProperty("/FromFilter")
                    var ToFilter = localModel.getProperty("/ToFilter")
                    var UserFilter = localModel.getProperty("/UserFilter")
                    var ActionFilter = localModel.getProperty("/ActionFilter")
                    var ServiceFilter = localModel.getProperty("/ServiceFilter")
    
                    var aFilters = []
                    if (FromFilter || ToFilter) {
                        var from = new Date("2015-01-01")
                        var to = new Date("9999-01-01")
                        if(ToFilter){
                            to = ToFilter 
                        }
                        if(FromFilter){
                              from =  FromFilter
                        }
                        var oFilter = new sap.ui.model.Filter({
                            path: "Date",
                            operator: sap.ui.model.FilterOperator.BT,
                            value1: from,
                            value2: to
                        })
    
                        aFilters.push(oFilter)
                    }
                   
                    if (UserFilter) {
                        var oFilter = new sap.ui.model.Filter("User", sap.ui.model.FilterOperator.Contains, UserFilter);
                        aFilters.push(oFilter)
                    }
                    if (ActionFilter) {
                        var oFilter = new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.Contains, ActionFilter);
                        aFilters.push(oFilter)
                    }
                    if (ServiceFilter) {
                        var oFilter = new sap.ui.model.Filter("Service", sap.ui.model.FilterOperator.Contains, ServiceFilter);
                        aFilters.push(oFilter)
                    }

                    if (iconTabSelected === "LOGS") {
                        var oFilter = new sap.ui.model.Filter("Error", sap.ui.model.FilterOperator.NE, true);
                        aFilters.push(oFilter)
                    } else if (iconTabSelected === "ERROR_LOGS") {
                        var oFilter = new sap.ui.model.Filter("Error", sap.ui.model.FilterOperator.EQ, true);
                        aFilters.push(oFilter)
                    }
    
    
                    try {
                        if (iconTabSelected === "LOGS") {
                            var res = await this._oData.read("/LogEntries", 
                            { "urlParameters": { "$select": "Date,User,Service,Category,Subaccount,Account,Application,Action,Object,ObjectRelated,ObjectType"}, "filters": aFilters })
                            if (res && res.results) {
                                localModel.setProperty("/Alogs", res.results)
                            }
                        } else if (iconTabSelected === "ERROR_LOGS") {
                            var res = await this._oData.read("/LogEntries", 
                            { "urlParameters": { "$select": "Date,Service,ErrorMessage,Message" }, "filters": aFilters })
                            if (res && res.results) {
                                localModel.setProperty("/ErrorLogs", res.results)
                            }
                        }
                    } catch (error) {
                        console.log(error)
                    }
    
                }else{
                    var currentDate = new Date();


                    currentDate.setHours(0, 0, 0, 0);
                    var oFilter = new sap.ui.model.Filter({
                        path: "createdAt",
                        operator: sap.ui.model.FilterOperator.BT,
                        value1: currentDate,
                        value2:  new Date("9999-01-01")
                    })

                    

                    try {
                        var res = await this._oData.read("/LogEntries?$select=Date,User,Service,Category,Subaccount,Account,Application,Action,Object,ObjectRelated,ObjectType", 
                        { "urlParameters": { "$select": "Date,User,Service,Category,Subaccount,Account,Application,Action,Object,ObjectRelated,ObjectType"}, "filters": [oFilter] })
                        if (res && res.results) {
                            localModel.setProperty("/Alogs", res.results)
                        }
                    } catch (error) {
                        console.log(error)
                    }
                }
            },

            clearAllSortings: function (oEvent) {
                var oTable = oEvent.getSource().getParent().getParent();

                oTable.getBinding().sort(null);
                var aColumns = oTable.getColumns();
                for (var i = 0; i < aColumns.length; i++) {
                    aColumns[i].setSorted(false);
                }
            },



            clearAllFiltersOpen: function (oEvent) {




                var oTable = oEvent.getSource().getParent().getParent();
                var columns = oTable.getColumns()
                columns.forEach((col) => {
                    col.setFilterValue("")
                    col.setFiltered(false);
                })


                oTable.getBinding("rows").filter([]);

            },
        });
    });
