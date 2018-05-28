"use strict";

import {emergeAppDatosExt} from "./app-datos-ext"
import {emergeAppBasOpe} from "operativos"
import { AppBackend } from "backend-plus"

var AppDatosExt = emergeAppDatosExt(emergeAppBasOpe(AppBackend));

new AppDatosExt().start();