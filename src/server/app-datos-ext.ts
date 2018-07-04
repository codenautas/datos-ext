"use strict";

import {ProceduresDatosExt} from "./procedures-datos-ext";
import * as operativos from "operativos";
import {AppOperativos, TablaDatos, TableDefinition, Context, TableDefinitionFunction, Variable, TipoVar} from "operativos";
import { Client } from "pg-promise-strict";

export * from "operativos";

type VariableWitType = (Variable & TipoVar);

export type Constructor<T> = new(...args: any[]) => T;

export function emergeAppDatosExt<T extends Constructor<InstanceType<typeof AppOperativos>>>(Base:T){
    
    return class AppDatosExt extends Base{
        constructor(...args:any[]){ 
            super(...args);
        }

        async generateAndLoadTableDef(client: Client, tablaDatos:TablaDatos){
            let nombreTablaDatos = tablaDatos.tabla_datos;
            let resultV = await client.query(
                `select *
                from variables left join tipovar using(tipovar)
                where operativo = $1 and tabla_datos = $2
                `,
                [tablaDatos.operativo, nombreTablaDatos]
            ).fetchAll();
            if(resultV.rowCount==0){
                throw new Error('La tabla no tiene variables');
            }
            let variables: VariableWitType[] = <VariableWitType[]>resultV.rows;
            let tableDef: TableDefinition = {
                name: nombreTablaDatos,
                fields: variables.map(function (v: VariableWitType) {
                    if (v.tipovar == null) {
                        throw new Error('la variable ' + v.variable + ' no tiene tipo');
                    }
                    return { name: v.variable, typeName: v.type_name };
                }),
                editable: true,
                primaryKey: variables.filter(v => v.es_pk).map(fieldDef => fieldDef.variable),
                sql: {
                    tableName: nombreTablaDatos,
                    isTable: true,
                    isReferable: true,
                    skipEnance: true
                },
            };
        
            //Load generated tableDef as function
            this.tableStructures[tableDef.name] = <TableDefinitionFunction> function (contexto: Context):TableDefinition {
                return contexto.be.tableDefAdapt(tableDef, contexto);
            };
        
            return tableDef;
        }
        
        async cargarGenerados(client: Client) {
            var be=this;
            let resultTD = await client.query('select * from tabla_datos where tabla_datos.estructura_cerrada = TRUE').fetchAll();
            await Promise.all(resultTD.rows.map((tablaDatosRow: TablaDatos) => this.generateAndLoadTableDef(client, be, tablaDatosRow))).then(//tdefs => {
                //tdefs.forEach(tdef => be.tableStructures[tdef.name] = (contexto: Context): TableDefinition => contexto.be.tableDefAdapt(tdef, contexto));
                //TODO: remove then()? o poner return sin await del promiseAll
        //    }
            );
            return "Se cargaron las tablas datos para visualizarlas mediante /menu?w=table&table=grupo_personas";
        }

        async postConfig(){
            var be=this;
            await super.postConfig();
            // var context = be.getContext();
            await be.inTransaction({} as operativos.Request, async function(client:Client){
                await be.cargarGenerados(client);
            });
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
                {menuType:'proc', name:'generar_tabla_datos', label:'generar tabla de datos externa', proc:'tabla_datos/generar'},
                {menuType:'proc', name:'cargar_generados', label:'Cargar Generados', proc:'tabla_datos/cargar_generados'},
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
export type AppDatosExtType = typeof AppDatosExt;