(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./app-datos-ext", "operativos", "backend-plus"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var app_datos_ext_1 = require("./app-datos-ext");
    var operativos_1 = require("operativos");
    var backend_plus_1 = require("backend-plus");
    var AppDatosExt = app_datos_ext_1.emergeAppDatosExt(operativos_1.emergeAppOperativos(backend_plus_1.AppBackend));
    new AppDatosExt().start();
});
//# sourceMappingURL=server-datos-ext.js.map