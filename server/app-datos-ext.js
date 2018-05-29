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
            let menu = { menu: [
                    { menuType: 'table', name: 'operativos' },
                    { menuType: 'table', name: 'origenes', label: 'orígenes' },
                    { menuType: 'table', name: 'variables' },
                    { menuType: 'proc', name: 'generar', proc: 'origenes/generar' },
                    { menuType: 'menu', name: 'admin', menuContent: [
                            { menuType: 'table', name: 'usuarios' },
                        ] }
                ] };
            return menu;
        }
        getTables() {
            return super.getTables().concat([]);
        }
    };
}
exports.emergeAppDatosExt = emergeAppDatosExt;
//# sourceMappingURL=app-datos-ext.js.map