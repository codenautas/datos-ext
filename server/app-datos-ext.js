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
            let myMenuPart = [
                { menuType: 'proc', name: 'generar', proc: 'origenes/generar' },
            ];
            let menu = { menu: super.getMenu().menu.concat(myMenuPart) };
            return menu;
        }
        prepareGetTables() {
            super.prepareGetTables();
            this.getTableDefinition = Object.assign({}, this.getTableDefinition);
            this.appendToTableDefinition('parametros', function (tableDef) {
                tableDef.fields.push({ name: 'esquema_tablas_externas', typeName: 'text', defaultValue: 'ext', editable: false });
            });
            this.appendToTableDefinition('tabla_datos', function (tableDef) {
                console.log(tableDef);
                tableDef.fields.push({ name: 'estructura_cerrada', typeName: 'boolean', editable: false });
                tableDef.constraints.push({ consName: 'estructura_cerrada true/null', constraintType: 'check', expr: 'estructura_cerrada is true' });
            });
        }
    };
}
exports.emergeAppDatosExt = emergeAppDatosExt;
//# sourceMappingURL=app-datos-ext.js.map