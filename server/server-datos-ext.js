"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_datos_ext_1 = require("./app-datos-ext");
const bas_ope_1 = require("bas-ope");
const backend_plus_1 = require("backend-plus");
var AppDatosExt = app_datos_ext_1.emergeAppDatosExt(bas_ope_1.emergeAppBasOpe(backend_plus_1.AppBackend));
new AppDatosExt().start();
//# sourceMappingURL=server-datos-ext.js.map