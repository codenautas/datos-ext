"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const procedures_datos_ext_1 = require("./procedures-datos-ext");
function emergeAppDatosExt(Base) {
    return class AppDatosExt extends Base {
        constructor(...args) {
            super(...args);
        }
        getProcedures() {
            var be = this;
            return super.getProcedures().then(function (procedures) {
                return procedures.concat(procedures_datos_ext_1.ProceduresDatosExt.map(be.procedureDefCompleter, be));
            });
        }
        clientIncludes(req, hideBEPlusInclusions) {
            return super.clientIncludes(req, hideBEPlusInclusions).concat([
                { type: 'js', src: 'client/datos-ext.js' },
            ]);
        }
        getMenu() {
            let menu = { menu: super.getMenu().menu.concat([
                    { menuType: 'proc', name: 'generar', proc: 'origenes/generar' },
                ]) };
            return menu;
        }
        prepareGetTables() {
            super.prepareGetTables();
            this.getTableDefinition = Object.assign({}, this.getTableDefinition);
            // this.appendToTableDefinition('operativos', function(tableDef){
            //     tableDef.detailTables.push(
            //         {table:'origenes', fields:['operativo'], abr:'O'}
            //     );
            // });
        }
        getTables() {
            return super.getTables().concat([]);
        }
    };
}
exports.emergeAppDatosExt = emergeAppDatosExt;
//# sourceMappingURL=app-datos-ext.js.map