"use strict";

import * as operativos from "operativos";
import { TablaDatos, tiposTablaDato } from "operativos";
import { procedures } from "./procedures-datos-ext";

export * from "./types-datos-ext";

export function emergeAppDatosExt<T extends operativos.Constructor<operativos.AppOperativosType>>(Base:T){
    
    return class AppDatosExt extends Base{
        constructor(...args:any[]){ 
            super(args);
            this.allProcedures = this.allProcedures.concat(procedures);
            this.allClientFileNames.push({type:'js', module: 'datos-ext', modPath: '../client', file: 'datos-ext.js', path: 'client_modules'})
        }
        configStaticConfig():void{
            super.configStaticConfig();
        }

        generateBaseTableDef(tablaDatos:TablaDatos){
            let tDef = super.generateBaseTableDef(tablaDatos);
            if (tablaDatos.tipo == tiposTablaDato.externa){
                // TODO: el insert y update true son provisorios para que procesamiento pueda hacer pruebas sin importar todo el excel de datos
                tDef.allow = {...tDef.allow, deleteAll: true, import: true, insert: true, update: true}
            }
            return tDef
        }

        prepareGetTables(){
            super.prepareGetTables();

            this.appendToTableDefinition('parametros', function(tableDef){
                tableDef.fields.push(
                    {name:'esquema_tablas_externas', typeName:'text', defaultValue:'ext', editable:false}
                );
            });
            this.appendToTableDefinition('tabla_datos', function(tableDef){
                tableDef.fields.push(
                    {name:"generar"           , typeName:'bigint' , editable:false, clientSide:'generarTD'}
                );
            });
        }
    }
}

export var AppDatosExt = emergeAppDatosExt(operativos.emergeAppOperativos(operativos.AppBackend));

