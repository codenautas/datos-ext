"use strict";

import {emergeAppDatosExt} from "./app-datos-ext"
import {emergeAppOperativos, AppBackend} from "operativos"

var AppDatosExt = emergeAppDatosExt(emergeAppOperativos(AppBackend));

new AppDatosExt().start();