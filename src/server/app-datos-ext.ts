"use strict";

import {ProceduresDatosExt} from "./procedures-datos-ext";
import * as operativos from "operativos";
import {AppOperativos} from "operativos";

export * from "operativos";

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
        clientIncludes(req:operativos.Request, hideBEPlusInclusions:boolean){
            return super.clientIncludes(req, hideBEPlusInclusions).concat([
                {type:'js' , src:'client/datos-ext.js'},
            ])
        }
        getMenu():operativos.MenuDefinition{
            let myMenuPart:operativos.MenuInfo[]=[
                {menuType:'proc', name:'generar_tabla_datos', label:'Generar Tabla de Datos Externa', proc:'tabla_datos/generar'},
            ];
            let menu = {menu: super.getMenu().menu.concat(myMenuPart)}
            return menu;
        }
        prepareGetTables(){
            super.prepareGetTables();
            this.getTableDefinition={
                ...this.getTableDefinition,
                // origenes,
                // variables
            }
            this.appendToTableDefinition('parametros', function(tableDef){
                tableDef.fields.push(
                    {name:'esquema_tablas_externas', typeName:'text', defaultValue:'ext', editable:false}
                );
            });
            this.appendToTableDefinition('tabla_datos', function(tableDef){
                console.log(tableDef)
                tableDef.fields.push(
                    {name:'estructura_cerrada', typeName:'boolean', editable:false}
                );
                tableDef.constraints.push(
                    {consName:'estructura_cerrada true/null', constraintType:'check', expr:'estructura_cerrada = true'}
                );
            });
        }
    }
}

export var AppDatosExt = emergeAppDatosExt(operativos.emergeAppOperativos(operativos.AppBackend));