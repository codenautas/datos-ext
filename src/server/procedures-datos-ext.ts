"use strict";

import {ProcedureContext, TableDefinition, Context, TableDefinitions, TableDefinitionFunction, Variable, TipoVar, TablaDatos, AppBackend} from "operativos";
import { AppDatosExtType} from "./app-datos-ext";

type TablaDatosGenerarParameters={
    operativo: string
    tabla_datos: string
}
var ProceduresDatosExt = [
    {
        action:'tabla_datos/cargar_generados',
        parameters:[
            {name:'operativo'  , typeName:'text', references:'operativos' },
        ],
        coreFunction:async function(context:ProcedureContext){
            let be= <AppDatosExtType>context.be;
            be.cargarGenerados(context.client);
        }
    },
    {
        action:'tabla_datos/generar',
        parameters:[
            {name:'operativo'  , typeName:'text', references:'operativos' },
            {name:'tabla_datos', typeName:'text', references:'tabla_datos'}
        ],
        coreFunction:async function(context:ProcedureContext, parameters:TablaDatosGenerarParameters){
            var be = <AppDatosExtType>context.be;

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
            var tableDef:TableDefinition = await be.generateAndLoadTableDef(context.client, parameters as TablaDatos); 
            var tableDefs: TableDefinitions = {};
            tableDefs[tableDef.name] = be.tableStructures[tableDef.name] // assign tableDef function
            var dump = await be.dumpDbSchemaPartial(tableDefs, {});
            var sqls = [/* 'do $SQL_DUMP$\n begin'*/ ]
            .concat(dump.mainSql)
            .concat(dump.enancePart)
            .concat([/* 'end\n$SQL_DUMP$'*/ ]);
            await context.client.query(sqls.join('\n')).execute();

            await context.client.query(
                `update tabla_datos
                set estructura_cerrada = true
                where operativo = $1 and tabla_datos = $2
                `,
                [parameters.operativo, parameters.tabla_datos]
            ).execute();

            if(tableDef.primaryKey.length){
                return 'Listo. Tabla creada con '+tableDef.primaryKey.length+' campos en la pk';
            }else{
                return 'ATENCION. Tabla creada sin pk'; 
            }
        }
    },   
];

export {ProceduresDatosExt};

