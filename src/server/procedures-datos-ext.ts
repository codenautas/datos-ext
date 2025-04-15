"use strict";

import { OperativoGenerator, TablaDatos, ProcedureDef, CoreFunctionParameters  } from 'operativos';
import { AppDatosExtType, ProcedureContext, TableDefinition, TableDefinitions } from './types-datos-ext';

var procedures: ProcedureDef[] = [
    {
        action:'tabla_datos_generar',
        parameters:[
            {name:'operativo'  , typeName:'text', references:'operativos' },
            {name:'tabla_datos', typeName:'text', references:'tabla_datos'}
        ],
        coreFunction:async function(context:ProcedureContext, parameters:CoreFunctionParameters<{ operativo: string; tabla_datos: string }>){
            let operativoGenerator = new OperativoGenerator(context.client, parameters.operativo);
            await operativoGenerator.fetchDataFromDB();

            var be = context.be as AppDatosExtType;
            let tablaDatos = <TablaDatos> (await TablaDatos.fetchOne(context.client, parameters.operativo, parameters.tabla_datos))
            
            if(tablaDatos.generada){
                throw new Error('La tabla ya estaba generada');
            }
            var tableDef:TableDefinition = be.generateBaseTableDef(tablaDatos); 
            var tableDefs: TableDefinitions = {};
            tableDefs[tableDef.name] = be.loadTableDef(tableDef);

            let updateFechaCalculada = `
            UPDATE tabla_datos td SET generada=current_timestamp 
              WHERE td.operativo=${context.be.db.quoteLiteral(parameters.operativo)} 
              AND td.tabla_datos=${context.be.db.quoteLiteral(parameters.tabla_datos)};`;
  
            var dump = await be.dumpDbSchemaPartial(tableDefs, {disableDBFunctions:true});
            var sqls = [`/* 'do $SQL_DUMP$\n begin'*/ `,dump.mainSql, dump.enancePart, updateFechaCalculada, `/* 'end\n$SQL_DUMP$'*/`];
            await context.client.query(sqls.join('\n')).execute();

            if(tableDef.primaryKey && tableDef.primaryKey.length){
                return 'Listo. Tabla creada con '+tableDef.primaryKey.length+' campos en la pk';
            }else{
                throw new Error('ATENCION. Tabla creada sin pk'); 
            }
        }
    },   
];

export { procedures };

