"use strict";

import {ProcedureContext, TableDefinition, Context, TableDefinitions, TableDefinitionFunction, Variable, TipoVar} from "operativos";

type TablaDatosGenerarParameters={
    operativo: string
    tabla_datos: string
}

type VariableWitType = (Variable & TipoVar);

function genTableDef(variables: VariableWitType[], tablaDatos: string, context: ProcedureContext) {
    var tableDef: TableDefinition = {
        name: tablaDatos,
        fields: variables.map(function (v: VariableWitType) {
            if (v.tipovar == null) {
                throw new Error('la variable ' + v.variable + ' no tiene tipo');
            }
            return { name: v.variable, typeName: v.type_name };
        }),
        editable: true,
        primaryKey: variables.filter(v => v.es_pk).map(fieldDef => fieldDef.variable),
        sql: {
            tableName: tablaDatos,
            isTable: true,
            isReferable: true,
            skipEnance: true
        },
    };
    return tableDef;
}

var ProceduresDatosExt = [
    {
        action:'tabla_datos/cargar_generados',
        parameters:[
        ],
        coreFunction:async function(context:ProcedureContext, parameters:{operativo:string}){
            var be=context.be;
            let resultTD = await context.client.query(
                `select *
                   from tabla_datos, parametros
                   where tabla_datos.estructura_cerrada = TRUE
                `
            ).fetchAll();
            await Promise.all(
                resultTD.rows.map(row => be.procedure['tabla_datos/generar_tabledef'].coreFunction(context, {operativo: row.operativo, tabla_datos:row.tabla_datos }) as Promise<TableDefinition>)
            ).then(tdefs => {
                tdefs.forEach(tdef => be.tableStructures[tdef.name] = (context: Context):TableDefinition => context.be.tableDefAdapt(tdef, context));
            });
            return "Se cargaron las tablas datos para visualizarlas mediante /menu?w=table&table=grupo_personas";
        }
    },
    {
        action:'tabla_datos/generar_tabledef',
        parameters:[
            {name:'operativo'  , typeName:'text', references:'operativos' },
            {name:'tabla_datos', typeName:'text', references:'tabla_datos'}
        ],
        coreFunction:async function(context:ProcedureContext, parameters:TablaDatosGenerarParameters){
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
            return genTableDef(resultV.rows as VariableWitType[], parameters.tabla_datos, context);
        }
    },
    {
        action:'tabla_datos/generar',
        parameters:[
            {name:'operativo'  , typeName:'text', references:'operativos' },
            {name:'tabla_datos', typeName:'text', references:'tabla_datos'}
        ],
        coreFunction:async function(context:ProcedureContext, parameters:TablaDatosGenerarParameters){
            var be=context.be;

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

            var tableDef:TableDefinition = await (be.procedure['tabla_datos/generar_tabledef'].coreFunction(context, parameters) as Promise<TableDefinition>);
            var tdefFunc: TableDefinitionFunction = be.tableStructures[tableDef.name] = function (context: Context):TableDefinition {
                return context.be.tableDefAdapt(tableDef, context);
            };
            var tableDefs: TableDefinitions = {};
            tableDefs[tableDef.name] = tdefFunc;
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
