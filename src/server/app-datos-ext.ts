"use strict";

import {AppBackend,Request} from "backend-plus";
import * as backendPlus from "backend-plus";
import * as pgPromise from "pg-promise-strict";
import * as express from "express";
import {ProceduresDatosExt} from "./procedures-datos-ext";

interface Context extends backendPlus.Context{
    puede:object
    superuser?:true
}

type MenuInfoMapa = {
    menuType:'mapa'
} & backendPlus.MenuInfoBase;

type MenuInfo = backendPlus.MenuInfo | MenuInfoMapa;
type MenuDefinition = {menu:MenuInfo[]}

export type Constructor<T> = new(...args: any[]) => T;

export function emergeAppDatosExt<T extends Constructor<AppBackend>>(Base:T){
 
    return class AppDatosExt extends Base{
        constructor(...args:any[]){
            super(...args);
        }
        getProcedures(){
            var be = this;
            return super.getProcedures().then(function(procedures){
                return procedures.concat(
                    ProceduresDatosExt.map(be.procedureDefCompleter, be)
                );
            });
        }    
        clientIncludes(req:Request, hideBEPlusInclusions:boolean){
            return super.clientIncludes(req, hideBEPlusInclusions).concat([
                {type:'js' , src:'client/datos-ext.js'},
            ])
        }
        getMenu():{menu:backendPlus.MenuInfoBase[]}{
            let menu:MenuDefinition = {menu:[
                {menuType:'table'  , name:'operativos' },
                {menuType:'table'  , name:'origenes'   , label:'orígenes'              },
                {menuType:'table'  , name:'variables'  },
                {menuType:'proc'   , name:'generar'    , proc:'origenes/generar'       },
                {menuType:'table'  , name:'usuarios'   },
            ]}
            return menu;
        }
        getTables(){
            return super.getTables().concat([]);
        }
    }
}