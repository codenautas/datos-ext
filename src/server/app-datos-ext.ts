"use strict";

import { procedures } from "./procedures-datos-ext";
import * as operativos from "operativos";
import { TablaDatos, tiposTablaDato } from "operativos";
import { Client } from "pg-promise-strict";

export * from "operativos";

export type Constructor<T> = new(...args: any[]) => T;

export function emergeAppDatosExt<T extends Constructor<operativos.AppOperativosType>>(Base:T){
    
    return class AppDatosExt extends Base{
        myProcedures: operativos.ProcedureDef[] = procedures;
        myClientFileName: string = 'datos-ext';
        constructor(...args:any[]){ 
            super(args);
            this.initialize();
        }

        async generateBaseTableDef(client: Client, tablaDatos:TablaDatos){
            let tDef = await super.generateBaseTableDef(client, tablaDatos);
            //TODO: dejar de preguntar por el postfix agregar un campo "esCalculada, esExterna o origen" a tablaDatos 
            if (tablaDatos.tipo == tiposTablaDato.externa){
                tDef.allow = {...tDef.allow, deleteAll: true, import: true}
            }
            return tDef
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

