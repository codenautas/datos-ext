"use strict";

import * as backendPlus from "backend-plus";
import {ProcedureContext} from "backend-plus";

type TablaDatosGenerarParameters={
    operativo: string
    tabla_datos: string
}

var ProceduresDatosExt = [
    {
        action:'tabla_datos/generar',
        parameters:[
            {name:'operativo'  , typeName:'text', references:'operativos' },
            {name:'tabla_datos', typeName:'text', references:'tabla_datos'}
        ],
        coreFunction:async function(context:ProcedureContext, parameters:TablaDatosGenerarParameters){
            var be=context.be;
            var db=be.db;
            let resultTD = await context.client.query(
                `select *
                   from tabla_datos, parametros
                   where operativo = $1 and tabla_datos = $2
                `,
                [parameters.operativo, parameters.tabla_datos]
            ).fetchUniqueRow();
            if(resultTD.row.estructura_cerrada){
                throw new Error('La tabla ya estaba generada');
            }
            await context.client.query(
                `update tabla_datos
                   set estructura_cerrada = true
                   where operativo = $1 and tabla_datos = $2
                `,
                [parameters.operativo, parameters.tabla_datos]
            ).execute();
            let resultV = await context.client.query(
                `select *
                   from variables left join tipovar using(tipovar)
                   where operativo = $1 and tabla_datos = $2
                `,
                [parameters.operativo, parameters.tabla_datos]
            ).fetchAll();
            if(resultV.rowCount==0){
                throw new Error('La tabla no tiene variables');
            }
            var primaryKey=resultV.rows.filter(fieldDef=>fieldDef.es_pk).map(fieldDef=>fieldDef.name);
            var tableDef:backendPlus.TableDefinition={
                name:resultTD.row.tabla_datos,
                fields:resultV.rows.map(function(fieldDef:{variable:string, tipovar:string, name:string, type_name:backendPlus.PgKnownTypes}){
                    if(fieldDef.tipovar==null){
                        throw new Error('la variable '+fieldDef.variable+' no tiene tipo');
                    }
                    return {name: fieldDef.name, typeName:fieldDef.type_name}
                }),
                primaryKey,
                sql:{
                    tableName:'ext_'+resultTD.row.tabla_datos
                },
            };
            var tableDefs:{
                [k:string]:backendPlus.TableDefinition
            }={};
            tableDefs[tableDef.name]=tableDef;
            var dump = await be.dumpDbSchemaPartial(tableDefs, {});
            var sqls = [/* 'do $SQL_DUMP$\n begin'*/ ]
            .concat(dump.mainSql)
            .concat(dump.enancePart)
            .concat([/* 'end\n$SQL_DUMP$'*/ ]);
            await context.client.query(sqls.join('\n')).execute();
            if(primaryKey.length){
                return 'Listo. Tabla creada con '+primaryKey.length+' campos en la pk';
            }else{
                return 'ATENCION. Tabla creada sin pk'; 
            }
        }
    },   
];

export {ProceduresDatosExt};