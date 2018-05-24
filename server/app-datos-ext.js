"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const origenes = require("./table-origenes");
function emergeAppDatosExt(Base) {
    return class AppDatosExt extends Base {
        constructor(...args) {
            super(...args);
        }
        getProcedures() {
            var be = this;
            return super.getProcedures().then(function (procedures) {
                return procedures.concat(require('./procedures-datos-ext.js').map(be.procedureDefCompleter, be));
            });
        }
        clientIncludes(req, hideBEPlusInclusions) {
            return super.clientIncludes(req, hideBEPlusInclusions).concat([
                { type: 'js', src: 'client/datos-ext.js' },
            ]);
        }
        getMenu() {
            let menu = { menu: [
                    { menuType: 'table', name: 'operativos' },
                    { menuType: 'table', name: 'origenes', label: 'orígenes' },
                    { menuType: 'table', name: 'variables' },
                    { menuType: 'proc', name: 'generar', proc: 'origenes/generar' },
                    { menuType: 'table', name: 'usuarios' },
                ] };
            return menu;
        }
        prepareGetTables() {
            super.prepareGetTables();
            this.getTableDefinition = Object.assign({}, this.getTableDefinition, { origenes });
            this.appendToTableDefinition('operativos', function (tableDef) {
                tableDef.detailTables.push({ table: 'origenes', fields: ['operativo'], abr: 'O' });
            });
        }
    };
}
exports.emergeAppDatosExt = emergeAppDatosExt;
//# sourceMappingURL=app-datos-ext.js.map