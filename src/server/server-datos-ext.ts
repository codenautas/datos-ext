"use strict";

import {emergeAppDatosExt} from "./app-datos-ext"
import {emergeAppOperativos} from "operativos"
import { AppBackend } from "backend-plus"

var AppDatosExt = emergeAppDatosExt(emergeAppOperativos(AppBackend));

new AppDatosExt().start();