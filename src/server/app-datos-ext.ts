"use strict";

import {AppBackend,Request} from "backend-plus";
import * as backendPlus from "backend-plus";
import * as pgPromise from "pg-promise-strict";
import * as express from "express";
import * as BasOpe from "bas-ope";
import {AppBasOpe,TableContext} from "bas-ope";

import * as origenes from "./table-origenes";

export type TableContext = TableContext;

export type Constructor<T> = new(...args: any[]) => T;

export function emergeAppDatosExt<T extends Constructor<InstanceType<typeof AppBasOpe>>>(Base:T){
 
    return class AppDatosExt extends Base{
        constructor(...args:any[]){
            super(...args);
        }
        getProcedures(){
            var be = this;
            return super.getProcedures().then(function(procedures){
                return procedures.concat(
                    require('./procedures-datos-ext.js').map(be.procedureDefCompleter, be)
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
        prepareGetTables(){
            super.prepareGetTables();
            this.getTableDefinition={
                ...this.getTableDefinition,
                origenes
            }
            this.appendToTableDefinition('operativos', function(tableDef){
                tableDef.detailTables.push(
                    {table:'origenes', fields:['operativo'], abr:'O'}
                );
            });
        }
    }
}