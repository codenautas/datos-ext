"use strict";

import { AppDatosExtType, ProcedureContext, TableDefinition, TableDefinitions, TablaDatoExterna} from './types-datos-ext'
import { TablaDatos } from 'operativos';

type TablaDatosGenerarParameters={
    operativo: string
    tabla_datos: string
}

var procedures = [
    {
        action:'tabla_datos/generar',
        parameters:[
            {name:'operativo'  , typeName:'text', references:'operativos' },
            {name:'tabla_datos', typeName:'text', references:'tabla_datos'}
        ],
        coreFunction:async function(context:ProcedureContext, parameters:TablaDatosGenerarParameters){
            var be = context.be as AppDatosExtType;
            let tablaDatos = <TablaDatoExterna> (await TablaDatos.fetchOne(context.client, parameters.operativo, parameters.tabla_datos))
            
            if(tablaDatos.estructura_cerrada){
                throw new Error('La tabla ya estaba generada');
            }
            var tableDef:TableDefinition = be.generateBaseTableDef(tablaDatos); 
            var tableDefs: TableDefinitions = {};
            tableDefs[tableDef.name] = be.loadTableDef(tableDef);

            let todayDate = be.getTodayForDB();
            let updateFechaCalculada = `
                UPDATE operativos SET calculada='${todayDate}' WHERE operativo='${parameters.operativo}';
                UPDATE tabla_datos td SET generada='${todayDate}' WHERE td.operativo='${parameters.operativo}' AND td.tabla_datos='${parameters.tabla_datos}';
            `;
            let cerrarStructura = `
                UPDATE tabla_datos
                SET estructura_cerrada = true
                WHERE operativo = '${parameters.operativo}' AND tabla_datos = '${parameters.tabla_datos}'
            `;
            var dump = await be.dumpDbSchemaPartial(tableDefs, {});
            var sqls = [/* 'do $SQL_DUMP$\n begin'*/ ]
            .concat(dump.mainSql)
            .concat(dump.enancePart)
            .concat(updateFechaCalculada)
            .concat(cerrarStructura)
            .concat([/* 'end\n$SQL_DUMP$'*/ ]);
            await context.client.query(sqls.join('\n')).execute();

            if(tableDef.primaryKey.length){
                return 'Listo. Tabla creada con '+tableDef.primaryKey.length+' campos en la pk';
            }else{
                return 'ATENCION. Tabla creada sin pk'; 
            }
        }
    },   
];

export {procedures};
