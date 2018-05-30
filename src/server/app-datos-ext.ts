"use strict";

import {Request} from "backend-plus";
import * as backendPlus from "backend-plus";
import * as pgPromise from "pg-promise-strict";
import * as express from "express";
import {ProceduresDatosExt} from "./procedures-datos-ext";
import {AppOperativos, TableContext} from "operativos";


// interface Context extends backendPlus.Context{
//     puede:object
//     superuser?:true
// }

export type TableContext = TableContext;

type MenuInfoMapa = {
    menuType:'mapa'
} & backendPlus.MenuInfoBase;

type MenuInfo = backendPlus.MenuInfo | MenuInfoMapa;
type MenuDefinition = {menu:MenuInfo[]}

export type Constructor<T> = new(...args: any[]) => T;

export function emergeAppDatosExt<T extends Constructor<InstanceType<typeof AppOperativos>>>(Base:T){
    
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
            let menu:MenuDefinition = {menu: super.getMenu().menu.concat([
                {menuType:'proc'   , name:'generar'    , proc:'origenes/generar'       },
            ])}
            return menu;
        }

        prepareGetTables(){
            super.prepareGetTables();
            this.getTableDefinition={
                ...this.getTableDefinition,
                // origenes,
                // variables,
                // variables_opciones
            }
            // this.appendToTableDefinition('operativos', function(tableDef){
            //     tableDef.detailTables.push(
            //         {table:'origenes', fields:['operativo'], abr:'O'}
            //     );
            // });
        }

        getTables(){
            return super.getTables().concat([]);
        }
    }
}