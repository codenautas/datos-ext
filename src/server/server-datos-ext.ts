"use strict";

import {emergeAppDatosExt} from "./app-datos-ext"
import { AppBackend } from "backend-plus";

var AppDatosExt = emergeAppDatosExt(AppBackend);

new AppDatosExt().start();