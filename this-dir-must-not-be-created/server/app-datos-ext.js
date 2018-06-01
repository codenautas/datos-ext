var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./procedures-datos-ext"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var procedures_datos_ext_1 = require("./procedures-datos-ext");
    function emergeAppDatosExt(Base) {
        return /** @class */ (function (_super) {
            __extends(AppDatosExt, _super);
            function AppDatosExt() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return _super.apply(this, args) || this;
            }
            AppDatosExt.prototype.getProcedures = function () {
                var be = this;
                return _super.prototype.getProcedures.call(this).then(function (procedures) {
                    return procedures.concat(procedures_datos_ext_1.ProceduresDatosExt.map(be.procedureDefCompleter, be));
                });
            };
            AppDatosExt.prototype.clientIncludes = function (req, hideBEPlusInclusions) {
                return _super.prototype.clientIncludes.call(this, req, hideBEPlusInclusions).concat([
                    { type: 'js', src: 'client/datos-ext.js' },
                ]);
            };
            AppDatosExt.prototype.getMenu = function () {
                var menu = { menu: _super.prototype.getMenu.call(this).menu.concat([
                        { menuType: 'proc', name: 'generar', proc: 'origenes/generar' },
                    ]) };
                return menu;
            };
            AppDatosExt.prototype.prepareGetTables = function () {
                _super.prototype.prepareGetTables.call(this);
                this.getTableDefinition = __assign({}, this.getTableDefinition);
                // this.appendToTableDefinition('operativos', function(tableDef){
                //     tableDef.detailTables.push(
                //         {table:'origenes', fields:['operativo'], abr:'O'}
                //     );
                // });
            };
            AppDatosExt.prototype.getTables = function () {
                return _super.prototype.getTables.call(this).concat([]);
            };
            return AppDatosExt;
        }(Base));
    }
    exports.emergeAppDatosExt = emergeAppDatosExt;
});
//# sourceMappingURL=app-datos-ext.js.map