sap.ui.define([
    "zapprferreira/controller/App.controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox) {
        "use strict";

        return Controller.extend("zapprferreira.controller.Detalhe", {
            onInit: function () {
                this.getRouter().getRoute("RouteDetalhe").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function (oEvent) {
                let ModeloAuxiliar = new JSONModel()
                let objeto = {
                    editable: false,
                    visibleEdit: true,
                    visibleSave: false
                }
                ModeloAuxiliar.setData(objeto)
                this.getView().setModel(ModeloAuxiliar, "Auxiliar")

                let id = oEvent.getParameter("arguments").id;

                this.getModel().refresh()
                this.getModel().metadataLoaded().then(function () {
                    var sObjectPath = this.getModel().createKey("AlunosFioriSet", {
                        Usuario: id
                    });
                    this._bindView("/" + sObjectPath);
                }.bind(this));

            },

            _bindView: function (sObjectPath) {
                // Set busy indicator during view binding
                var oViewModel = this.getView().getModel();
                var that = this;
                // If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
                oViewModel.setProperty("/busy", false);
                this.getView().bindElement({
                    path: sObjectPath,
                    events: {
                        change: this._onBindingChange.bind(this),
                        dataRequested: function () {
                            oViewModel.setProperty("/busy", true);
                        },
                        dataReceived: function () {
                            oViewModel.setProperty("/busy", false);
                        }
                    }
                });
            },

            _onBindingChange: function () {
                var oView = this.getView(),
                    oElementBinding = oView.getElementBinding();

                if (!oElementBinding.getBoundContext()) {

                    return;
                }

            },

            onEdita: function () {
                let oModel = this.getView().getModel("Auxiliar")
                let oData = oModel.getData()

                oData.editable = true
                oData.visibleEdit = false,
                    oData.visibleSave = true
                oModel.refresh()
            },

            onCancela: function () {
                let oModel = this.getView().getModel()
                oModel.refresh()

                let that = this
                sap.m.MessageBox.alert("Confirma o cancelamento da edição?", {
                    actions: ["Sim", "Não"],
                    onClose: function (sAction) {
                        let oModelAuxiliar = that.getView().getModel("Auxiliar")
                        let oData = oModelAuxiliar.getData()

                        oData.editable = false
                        oData.visibleEdit = true
                        oData.visibleSave = false
                        oModelAuxiliar.refresh()
                    }
                })

            },

            onSalva: function () {
                let idNome = this.getView().byId("idNome").getValue()
                let Email = this.getView().byId("Email").getValue()
                let ProjetoSegw = this.getView().byId("ProjetoSegw").getValue()
                let idCep = this.getView().byId("idCep").getValue()
                let idEndereco = this.getView().byId("idEndereco").getValue()
                let idBairro = this.getView().byId("idBairro").getValue()
                let that = this
                let chave = this.getView().byId("Usuario").getValue()

                let objeto = {
                    Nome: idNome,
                    ProjetoSegw: ProjetoSegw,
                    Email: Email,
                    Cep: idCep,
                    Endereco: idEndereco,
                    Bairro: idBairro
                }

                this.getView().getModel().update("/AlunosFioriSet('" + chave + "')", objeto, {
                    success: function (oData, oReponse) {
                        sap.m.MessageBox.success("Usuario atualizado com sucesso!!!", {
                            actions: ["Ok"],
                            onClose: function (sAction) {
                                that.onCancela()
                                that.getRouter().navTo("RouteView1")
                            }
                        })

                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Erro ao atualizar o aluno !!!");
                    }
                });
            },

            onChangeCEP: function(){
                let that = this
                let idCep = this.getView().byId("idCep").getValue()
                let oModel = this.getView().getModel()
                var url = "https://viacep.com.br/ws/" + idCep + "/json/";
                $.ajax({
                    url: url,
                    dataType: "jsonp",
                    beforeSend: function (xhr) {
                        oModel.setProperty("/busy", true)
                    },
                    success: function (response) {
                        oModel.setProperty("/busy", false)
                        let cep = response.cep
                        let endereco = response.logradouro
                        let bairro = response.bairro
                        that.getView().byId("idCep").setValue(cep)
                        that.getView().byId("idEndereco").setValue(endereco)
                        that.getView().byId("idBairro").setValue(bairro)
                    },
                    error: function () {
                        oModel.setProperty("/busy", false)
                    }
                });
            }
        });
    });
