"use strict";

import { emergeAppOperativos, AppOperativosType, OptsClientPage } from "operativos";
import {Constructor, Request, AppBackend,TablaDatos, tiposTablaDato } from "./types-datos-ext";
import { procedures } from "./procedures-datos-ext";
import {defConfig} from "./def-config";
import { tabla_datos_comp } from "./table-tabla_datos_comp";

export * from "./types-datos-ext";

// Ejemplo mas sencillo de herencia dinámica
//import { OperativoGenerator } from "operativos";
// function emergeClases<CB extends Constructor<OperativoGenerator>>(ClaseBase:CB){
//     return class ClaseHija extends ClaseBase{
//         campo1: string='default text';
//         constructor(...args:any[]){ 
//             super(args);
//         }
//     }
// }

export function emergeAppDatosExt<T extends Constructor<AppOperativosType>>(Base:T){
    
    return class AppDatosExt extends Base{
        constructor(...args:any[]){ 
            super(args);
        }
        configStaticConfig(){
            super.configStaticConfig();
            this.setStaticConfig(defConfig);
        }

        generateBaseTableDef(tablaDatos:TablaDatos){
            let tDef = super.generateBaseTableDef(tablaDatos);
            if (tablaDatos.tipo == tiposTablaDato.externa){
                // TODO: el insert y update true son provisorios para que procesamiento pueda hacer pruebas sin importar todo el excel de datos
                tDef.allow = {...tDef.allow, deleteAll: true, import: true, insert: true, update: true}
            }
            return tDef
        }
        async getProcedures(){
            var parentProc = await super.getProcedures()
            return parentProc.concat(procedures);
        }
        clientIncludes(req:Request, hideBEPlusInclusions:OptsClientPage){
            return super.clientIncludes(req, hideBEPlusInclusions).concat([
                {type:'js', module: 'datos-ext', modPath: '../client', file: 'datos-ext.js', path: 'client_modules'}
            ])
        }
        prepareGetTables(){
            super.prepareGetTables();
            this.getTableDefinition={
                ...this.getTableDefinition,
                tabla_datos_comp
            }
            this.appendToTableDefinition('parametros', function(tableDef){
                tableDef.fields.push(
                    {name:'esquema_tablas_externas', typeName:'text', defaultValue:'ext', editable:false}
                );
            });
            this.appendToTableDefinition('tabla_datos', function(tableDef){
                tableDef.fields.push(
                    {name:"generar"           , typeName:'bigint' , editable:false, clientSide:'generarTD'}
                );
                tableDef.detailTables?.push(
                    {table:'tabla_datos_comp', fields:['operativo', 'tabla_datos'], abr:'⚕', label:'consistencias'}
                )
            });
        }
    }
}

export var AppDatosExt = emergeAppDatosExt(emergeAppOperativos(AppBackend));

