"use strict";

import { OperativoGenerator, TablaDatos, AppOperativos } from 'operativos';
import { AppDatosExtType, ProcedureContext, TableDefinition, TableDefinitions } from './types-datos-ext';

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
            let operativoGenerator = new OperativoGenerator(parameters.operativo);
            await operativoGenerator.fetchDataFromDB(context.client);

            var be = context.be as AppDatosExtType;
            let tablaDatos = <TablaDatos> (await TablaDatos.fetchOne(context.client, parameters.operativo, parameters.tabla_datos))
            
            if(tablaDatos.generada){
                throw new Error('La tabla ya estaba generada');
            }
            var tableDef:TableDefinition = be.generateBaseTableDef(tablaDatos); 
            var tableDefs: TableDefinitions = {};
            tableDefs[tableDef.name] = be.loadTableDef(tableDef);

            let todayDate = AppOperativos.getTodayForDB();
            let updateFechaCalculada = `
                UPDATE operativos SET calculada='${todayDate}' WHERE operativo='${parameters.operativo}';
                UPDATE tabla_datos td SET generada='${todayDate}' WHERE td.operativo='${parameters.operativo}' AND td.tabla_datos='${parameters.tabla_datos}';
            `;
  
            var dump = await be.dumpDbSchemaPartial(tableDefs, {});
            var sqls = [/* 'do $SQL_DUMP$\n begin'*/ ]
            .concat(dump.mainSql)
            .concat(dump.enancePart)
            .concat(updateFechaCalculada)
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

export { procedures };

