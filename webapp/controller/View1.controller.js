sap.ui.define([
    "zapprferreira/controller/App.controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/library",
    "sap/m/MessagePopover",
    'sap/ui/table/Column',
    'sap/ui/model/FilterOperator',
    "sap/ui/model/Filter",
    "sap/m/MessageItem"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MLibrary, MessagePopover, UIColumn, FilterOperator, Filter, MessageItem,) {
        "use strict";

        var oMessagePopover;

        return Controller.extend("zapprferreira.controller.View1", {
            onInit: function () {
                this.criaModeloAuxiliar()
            },

            onValueHelpUser: function () {

                if (!this.pDialog) {
                    this.pDialog = this.loadFragment({
                        name: "zapprferreira.view.fragmentos.ValueHelpUser"
                    });
                }
                this.pDialog.then(function (oDialog) {
                    var oFilterBar = oDialog.getFilterBar();
                    this._oVHD = oDialog;
                    // Initialise the dialog with model only the first time. Then only open it
                    if (this._bDialogInitialized) {
                        // Re-set the tokens from the input and update the table
                        oDialog.open();
                        return;
                    }
                    this.getView().addDependent(oDialog);

                    // Set Basic Search for FilterBar
                    oFilterBar.setFilterBarExpanded(true);
                    oDialog.getTableAsync().then(function (oTable) {

                        oTable.setModel(this.oProductsModel);
                        // For Desktop and tabled the default table is sap.ui.table.Table
                        if (oTable.bindRows) {
                            // Bind rows to the ODataModel and add columns
                            oTable.bindAggregation("rows", {
                                path: "/ZshHelpAlunoRfmSet",
                                events: {
                                    dataReceived: function () {
                                        oDialog.update();
                                    }
                                }
                            });
                            oTable.addColumn(new UIColumn({ label: "Usuario", template: "Usuario" }));
                            oTable.addColumn(new UIColumn({ label: "Nome", template: "Nome" }));
                            oTable.addColumn(new UIColumn({ label: "Email", template: "Email" }));
                        }

                        // For Mobile the default table is sap.m.Table
                        if (oTable.bindItems) {
                            // Bind items to the ODataModel and add columns
                            oTable.bindAggregation("items", {
                                path: "/ZshHelpAlunoRfmSet",
                                template: new ColumnListItem({
                                    cells: [new Label({ text: "{Usuario}" }), new Label({ text: "{Nome}" }), new Label({ text: "{Email}" })]
                                }),
                                events: {
                                    dataReceived: function () {
                                        oDialog.update();
                                    }
                                }
                            });
                            oTable.addColumn(new MColumn({ header: new Label({ text: "Usuario" }) }));
                            oTable.addColumn(new MColumn({ header: new Label({ text: "Nome" }) }));
                            oTable.addColumn(new MColumn({ header: new Label({ text: "Email" }) }));
                        }
                        oDialog.update();
                    }.bind(this));

                    // set flag that the dialog is initialized
                    this._bDialogInitialized = true;
                    oDialog.open();
                }.bind(this));
            },

            onFilterBarSearchUserA: function (oEvent) {
                var aSelectionSet = oEvent.getParameter("selectionSet");

                var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
                    if (oControl.getValue()) {
                        aResult.push(new Filter({
                            path: oControl.getName(),
                            operator: FilterOperator.Contains,
                            value1: oControl.getValue()
                        }));
                    }

                    return aResult;
                }, []);


                this._filterTableA(new Filter({
                    filters: aFilters,
                    and: true
                }));
            },

            _filterTableA: function (oFilter) {
                var oVHD = this._oVHD;

                oVHD.getTableAsync().then(function (oTable) {
                    if (oTable.bindRows) {
                        oTable.getBinding("rows").filter(oFilter);
                    }
                    if (oTable.bindItems) {
                        oTable.getBinding("items").filter(oFilter);
                    }

                    // This method must be called after binding update of the table.
                    oVHD.update();
                });
            },

            onValueHelpOkPressA: function (oEvent) {
                var aTokens = oEvent.getParameter("tokens");
                var sUser = aTokens[0].getProperty("key");
                this._user = this.byId("idUserHelp");
                this._user.setValue(sUser);
                this._oVHD.close();
            },

            onValueHelpCancelPressA: function (oEvent) {
                this._oVHD.close();
            },

            criaModeloAuxiliar: function () {
                let oModel = new JSONModel()
                let objeto = {
                    Menssagens: [],
                    Editable: false
                }

                oModel.setData(objeto)
                this.getView().setModel(oModel, "Auxiliar")

                this.AlimentaModeloMenssagens()
            },

            AlimentaModeloMenssagens: function () {
                let oMessageTemplate = new MessageItem({
                    type: '{Auxiliar>type}',
                    title: '{Auxiliar>title}',
                    activeTitle: "{Auxiliar>active}",
                    description: '{Auxiliar>description}',
                    subtitle: '{Auxiliar>subtitle}',
                    counter: '{Auxiliar>counter}'
                });

                oMessagePopover = new MessagePopover({
                    items: {
                        path: 'Auxiliar>/Menssagens',
                        template: oMessageTemplate
                    },
                    activeTitlePress: function () {

                    }
                });

                var messagePopoverBtn = this.byId("messagePopoverBtn");

                if (messagePopoverBtn) {
                    this.byId("messagePopoverBtn").addDependent(oMessagePopover);
                }
            },

            acessaMaterialCurso: function () {
                let URLHelper = MLibrary.URLHelper;
                URLHelper.redirect("https://uh924mhkawsbhi-my.sharepoint.com/personal/exed_academy_exedconsulting_com/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fexed%5Facademy%5Fexedconsulting%5Fcom%2FDocuments%2F01%2E%20CURSOS%2FC035%20%2D%20SAP%20FIORI%20%28%40BRA%5FABERTO%29%2F03%2E%20Diret%C3%B3rio%20Alunos%20%2D%20Curso%20SAP%20FIORI%2F01%2E%20Materiais&ct=1713275873542&or=Teams%2DHL&ga=1", true);
            },

            acessaGitHub: function () {
                let URLHelper = MLibrary.URLHelper;
                URLHelper.redirect("https://github.com/robsonfdemelo/zcursoapprferreira.git", true);
            },

            onDeleta: function () {
                let that = this
                let oModel = this.getView().getModel()
                let oModelAuxiliar = this.getView().getModel("Auxiliar")
                let Table = this.getView().byId("idTable")
                let selecionados = Table.getSelectedContextPaths()
                if (selecionados.length > 0) {
                    sap.m.MessageBox.alert("Confirma a exclusão de todos os alunos selecionados?", {
                        actions: ["Sim", "Não"],
                        onClose: function (sAction) {
                            if (sAction == "Sim") {
                                let Indice
                                for (let i = 0; i < selecionados.length; i++) {
                                    Indice = selecionados[i]
                                    oModel.remove(Indice, {
                                        success: function () {
                                            let arrayMsg = {
                                                type: "Success",
                                                title: "Aluno excluido com sucesso",
                                                activeTitle: true,
                                                description: "O aluno com indice " + Indice + " foi excluido com sucesso!!!",
                                            }
                                            oModelAuxiliar.oData.Menssagens.push(arrayMsg);
                                            oModelAuxiliar.refresh(true);

                                            that.byId("messagePopoverBtn").setType("Accept");
                                            oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                        },
                                        error: function () {
                                            let arrayMsg = {
                                                type: "Error",
                                                title: "Erro ao excluir o aluno",
                                                activeTitle: true,
                                                description: "Erro ao excluir o aluno com indice " + Indice + " !!!",
                                            }
                                            oModelAuxiliar.oData.Menssagens.push(arrayMsg);
                                            oModelAuxiliar.refresh(true);

                                            that.byId("messagePopoverBtn").setType("Accept");
                                            oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                        }
                                    })
                                }
                            }
                        }
                    })
                } else {
                    sap.m.MessageBox.error("Selecione ao menos um aluno para exclusão!!!")
                }
            },

            onAdciona: function () {
                if (!this.adicionar) {
                    this.adicionar = sap.ui.xmlfragment("zapprferreira.view.fragmentos.Adicionar", this);
                    this.getView().addDependent(this.adicionar);
                }
                // open value help dialog filtered by the input value
                this.adicionar.open();
            },

            CancelarAdicionar: function () {
                this.adicionar.close();
            },

            GravaAdicionar: function () {
                let that = this
                let oModel = this.getView().getModel()
                let oModelAuxiliar = this.getView().getModel("Auxiliar")
                let Usuario = this.adicionar.mAggregations.content[0].getValue()
                let Nome = this.adicionar.mAggregations.content[1].getValue()
                let Email = this.adicionar.mAggregations.content[2].getValue()
                let Projeto = this.adicionar.mAggregations.content[3].getValue()
                let Cep = this.adicionar.mAggregations.content[4].getValue()
                let Endereco = this.adicionar.mAggregations.content[5].getValue()
                let Bairro = this.adicionar.mAggregations.content[6].getValue()

                var oDados = {
                    "Usuario": Usuario
                }

                this.getView().getModel().callFunction('/GetUserExist', {
                    method: "GET",
                    urlParameters: oDados,
                    success: function (oData, oReponse) {
                        if (!oReponse.data.OK) {
                            sap.m.MessageBox.alert("Confirma a inclusão?", {
                                actions: ["Sim", "Não"],
                                onClose: function (sAction) {
                                    if (sAction == "Sim") {
                                        let objeto = {
                                            Usuario: Usuario,
                                            Nome: Nome,
                                            ProjetoSegw: Projeto,
                                            Email: Email,
                                            Cep: Cep,
                                            Endereco: Endereco,
                                            Bairro: Bairro
                                        }
                                        oModel.create('/AlunosFioriSet', objeto, {
                                            success: function (oData, oReponse) {
                                                let arrayMsg = {
                                                    type: "Success",
                                                    title: "Aluno incluido com sucesso !!!",
                                                    activeTitle: true,
                                                    description: "O aluno " + Usuario + " foi incluido com sucesso!!!",
                                                }
                                                oModelAuxiliar.oData.Menssagens.push(arrayMsg);
                                                oModelAuxiliar.refresh(true);

                                                that.byId("messagePopoverBtn").setType("Accept");
                                                oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                                that.CancelarAdicionar()
                                            },
                                            error: function (oError) {
                                                let arrayMsg = {
                                                    type: "Error",
                                                    title: "Erro ao incluir aluno !!!",
                                                    activeTitle: true,
                                                    description: "Erro ao incluir aluno " + Usuario + " !!!",
                                                }
                                                oModelAuxiliar.oData.Menssagens.push(arrayMsg);
                                                oModelAuxiliar.refresh(true);

                                                that.byId("messagePopoverBtn").setType("Accept");
                                                oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                            }
                                        });
                                    }
                                }
                            })
                        } else {
                            sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("msgErroAlunoExist"));
                        }
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("lblMsgCreateError"));
                    }
                });


            },

            handleMessagePopoverPress: function () {
                oMessagePopover.openBy(this.getView().byId("messagePopoverBtn"));
            },

            onEdit: function () {
                let Table = this.getView().byId("idTable")
                let selecionados = Table.getSelectedItems();
                if (selecionados.length == 0) {
                    sap.m.MessageBox.error("Nenhum Registro Selecionado!!!")
                } else if (selecionados.length > 0) {
                    if (selecionados.length > 1) {
                        sap.m.MessageBox.error("Só poderá ser editado um registro por vez !!!")
                    } else {
                        let id = selecionados[0].mAggregations.cells[0].getProperty("text")

                        this.getRouter().navTo("RouteDetalhe", {
                            id
                        });
                    }
                }
            },

            onChangeArquivo: function (oEvent) {
                let file = oEvent.mParameters.files[0];
                let tipoArquivo = oEvent.mParameters.files[0].type;
                let oModel = this.getView().getModel();
                let oModelAuxiliar = this.getView().getModel("Auxiliar")
                let that = this

                if (tipoArquivo !== "text/csv") {
                    MessageBox.error("Seram aceitos apenas arquivos CSV.");
                    return;
                }

                var reader = new FileReader();
                reader.readAsText(file);

                reader.onload = function () {
                    let texto = reader.result;
                    let linhas = texto.split("\r\n");
                    let lengthLinhas = linhas.length;

                    let Cabecalho = linhas[0].split(";");

                    if (Cabecalho[0] !== "Usuario") {
                        sap.m.MessageBox.error(
                            "A primeira coluna do CSV, deverá ser 'Usuario'."
                        );
                        return;
                    }

                    if (Cabecalho[1] !== "Nome") {
                        sap.m.MessageBox.error(
                            "A segunda coluna do CSV, deverá ser 'Nome'."
                        );
                        return;
                    }

                    if (Cabecalho[2] !== "Email") {
                        sap.m.MessageBox.error(
                            "A terceira coluna do CSV, deverá ser 'Email'."
                        );
                        return;
                    }

                    if (Cabecalho[3] !== "ProjetoSegw") {
                        sap.m.MessageBox.error("A quarta coluna do CSV, deverá ser 'Projeto SEGW'.");
                        return;
                    }

                    for (let i = 0; i < lengthLinhas; i++) {
                        if (i !== 0) {
                            let split = linhas[i].split(";");
                            let objeto = {
                                Usuario: split[0],
                                Nome: split[1],
                                Email: split[2],
                                ProjetoSegw: split[3]
                            };
                            if (objeto.Usuario !== "") {
                                oModel.create('/AlunosFioriSet', objeto, {
                                    success: function (oData, oReponse) {
                                        let arrayMsg = {
                                            type: "Success",
                                            title: "Aluno incluido com sucesso !!!",
                                            activeTitle: true,
                                            description: "O aluno " + objeto.Usuario + " foi incluido com sucesso!!!",
                                        }
                                        oModelAuxiliar.oData.Menssagens.push(arrayMsg);
                                        oModelAuxiliar.refresh(true);

                                        that.byId("messagePopoverBtn").setType("Accept");
                                        oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                        that.CancelarAdicionar()
                                    },
                                    error: function (oError) {
                                        let arrayMsg = {
                                            type: "Error",
                                            title: "Erro ao incluir aluno !!!",
                                            activeTitle: true,
                                            description: "Erro ao incluir aluno " + objeto.Usuario + " !!!",
                                        }
                                        oModelAuxiliar.oData.Menssagens.push(arrayMsg);
                                        oModelAuxiliar.refresh(true);

                                        that.byId("messagePopoverBtn").setType("Accept");
                                        oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                    }
                                });
                            }
                        }
                    }
                    oModel.refresh()
                };
            }

        });
    });
