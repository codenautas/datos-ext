"use strict";

import {emergeAppDatosExt} from "./app-datos-ext"
import {emergeAppBasOpe} from "bas-ope"
import { AppBackend } from "backend-plus"

var AppDatosExt = emergeAppDatosExt(emergeAppBasOpe(AppBackend));

new AppDatosExt().start();