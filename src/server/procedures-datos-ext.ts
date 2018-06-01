"use strict";

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
            var schema_table_name=`${db.quoteIdent(resultTD.row.esquema_tablas_externas)}${db.quoteIdent(parameters.tabla_datos)}`
            var sql=`create table ${schema_table_name}(
                ${resultV.rows.map(function(fieldDef){
                    if(fieldDef.tipovar==null){
                        throw new Error('la variable '+fieldDef.variable+' no tiene tipo');
                    }
                    return db.quoteIdent(fieldDef.name)+' '+fieldDef.type_name
                }).join(',\n')}
            )`;
            await context.client.query(sql).execute();
            var pks=resultV.rows.filter(fieldDef=>fieldDef.es_pk).map(fieldDef=>fieldDef.name);
            if(pks.length){
                sql = 'alter table ${schema_table_name} add primary key ('+pks.join(',')+');'
                await context.client.query(sql).execute();
                return 'Listo. Tabla creada con '+pks.length+' campos en la pk';
            }else{
                return 'ATENCION. Tabla creada sin pk'; 
            }
        }
    },   
];

export {ProceduresDatosExt};