"use strict";

import {procedures} from "./procedures-datos-ext";
import * as operativos from "operativos";
import { TablaDatos, sufijoTablaDato } from "operativos";
import { Client } from "pg-promise-strict";

export * from "operativos";

export const sufijo_tabla_externa:string='_ext';

export type Constructor<T> = new(...args: any[]) => T;

export function emergeAppDatosExt<T extends Constructor<operativos.AppOperativosType>>(Base:T){
    
    return class AppDatosExt extends Base{
        constructor(...args:any[]){ 
            super(...args);
            this.myProcedures = this.myProcedures.concat(procedures);
            this.myClientFileName = 'datos-ext';
        }

        getMenu():operativos.MenuDefinition{
            let myMenuPart:operativos.MenuInfo[]=[
                {menuType:'proc', name:'generar_tabla_datos', label:'generar tabla de datos externa', proc:'tabla_datos/generar'}
            ];
            let menu = {menu: super.getMenu().menu.concat(myMenuPart)}
            return menu;
        }

        async generateBaseTableDef(client: Client, tablaDatos:TablaDatos){
            let td = await super.generateBaseTableDef(client, tablaDatos);
            //TODO: dejar de preguntar por el postfix agregar un campo "esCalculada, esExterna o origen" a tablaDatos 
            if (tablaDatos.sufijo == sufijoTablaDato.externa){
                td.allow = {...td.allow, deleteAll: true, import: true}
            }
            return td
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
export type AppDatosExtType = InstanceType<typeof AppDatosExt>;
