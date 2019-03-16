"use strict";

import { emergeAppOperativos, AppOperativosType } from "operativos";
import {Constructor, Request, AppBackend,TablaDatos, tiposTablaDato } from "./types-datos-ext";
import { procedures } from "./procedures-datos-ext";
import {defConfig} from "./def-config";

export * from "./types-datos-ext";

export function emergeAppDatosExt<T extends Constructor<AppOperativosType>>(Base:T){
    
    return class AppDatosExt extends Base{
        constructor(...args:any[]){ 
            super(args);
            this.allProcedures = this.allProcedures.concat(procedures);
            this.allClientFileNames.push({type:'js', module: 'datos-ext', modPath: '../client', file: 'datos-ext.js', path: 'client_modules'})
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

        clientIncludes(req:Request, hideBEPlusInclusions?:boolean){
            return super.clientIncludes(req, hideBEPlusInclusions);
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

export var AppDatosExt = emergeAppDatosExt(emergeAppOperativos(AppBackend));

