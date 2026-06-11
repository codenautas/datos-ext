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
  
            var dump = await be.dumpDbSchemaPartial(tableDefs, {disableDBFunctions:true, commonFunsToDisable:['get_app_user-fun.sql','semver_to_decimal-fun.sql']});
            var sqls = [`/* 'do $SQL_DUMP$\n begin'*/ `,dump.mainSql, dump.enancePart, updateFechaCalculada, `/* 'end\n$SQL_DUMP$'*/`];
            await context.client.query(sqls.join('\n')).execute();

            if(tableDef.primaryKey && tableDef.primaryKey.length){
                return 'Listo. Tabla creada con '+tableDef.primaryKey.length+' campos en la pk';
            }else{
                throw new Error('ATENCION. Tabla creada sin pk'); 
            }
        }
    },   
    {
        action:'tabla_datos_fisica_eliminar',
        parameters:[
            {name:'operativo'  , typeName:'text', references:'operativos' },
            {name:'tabla_datos', typeName:'text', references:'tabla_datos'}
        ],
        coreFunction:async function(context:ProcedureContext, parameters:CoreFunctionParameters<{ operativo: string; tabla_datos: string }>){
            let operativoGenerator = new OperativoGenerator(context.client, parameters.operativo);
            await operativoGenerator.fetchDataFromDB();

            var be = context.be as AppDatosExtType;
            let tablaDatos = <TablaDatos> (await TablaDatos.fetchOne(context.client, parameters.operativo, parameters.tabla_datos))
            
            if(!tablaDatos.generada){
                throw new Error(`La tabla ${parameters.tabla_datos} no ha sido generada`);
            }
            if(tablaDatos.tipo!='externa'){
                throw new Error(`La tabla ${parameters.tabla_datos} no es una tabla externa`);
            }

            var tablaExternaFisica= be.db.quoteIdent(tablaDatos.getTableName());
            var cantReg=(await context.client.query( `
                select Count(*) from ${tablaExternaFisica}
            `).fetchUniqueValue()).value;
            if(cantReg>0){
                throw new Error(`La tabla ${parameters.tabla_datos} tiene registros, no se puede eliminar`);
            }
        
            var tableDef:TableDefinition = be.generateBaseTableDef(tablaDatos); 
            delete be.tableStructures[tableDef.name];
            // falta sacar de la estructura de tablas
            var dropTablaFisica= `DROP TABLE ${tablaExternaFisica};`; 
            let updateFechaCalculada = `
            UPDATE tabla_datos td SET generada=null
              WHERE td.operativo=${be.db.quoteLiteral(parameters.operativo)} 
              AND td.tabla_datos=${be.db.quoteLiteral(parameters.tabla_datos)};`;
  
            var sqls = [dropTablaFisica, updateFechaCalculada, `/* 'end\n$SQL_DUMP$'*/`];
            await context.client.query(sqls.join('\n')).execute();

            return 'Listo. Tabla externa '+ parameters.tabla_datos +' eliminada en la Base de Datos ';
        }
    },   
];

export { procedures };

