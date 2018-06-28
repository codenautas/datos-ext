"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ProceduresDatosExt = [
    {
        action: 'tabla_datos/generar',
        parameters: [
            { name: 'operativo', typeName: 'text', references: 'operativos' },
            { name: 'tabla_datos', typeName: 'text', references: 'tabla_datos' }
        ],
        coreFunction: async function (context, parameters) {
            var be = context.be;
            let resultTD = await context.client.query(`select *
                   from tabla_datos, parametros
                   where operativo = $1 and tabla_datos = $2
                `, [parameters.operativo, parameters.tabla_datos]).fetchUniqueRow();
            if (resultTD.row.estructura_cerrada) {
                throw new Error('La tabla ya estaba generada');
            }
            await context.client.query(`update tabla_datos
                   set estructura_cerrada = true
                   where operativo = $1 and tabla_datos = $2
                `, [parameters.operativo, parameters.tabla_datos]).execute();
            let resultV = await context.client.query(`select *
                   from variables left join tipovar using(tipovar)
                   where operativo = $1 and tabla_datos = $2
                `, [parameters.operativo, parameters.tabla_datos]).fetchAll();
            if (resultV.rowCount == 0) {
                throw new Error('La tabla no tiene variables');
            }
            var primaryKey = resultV.rows.filter(fieldDef => fieldDef.es_pk).map(fieldDef => fieldDef.variable);
            var tableDef = {
                name: resultTD.row.tabla_datos,
                fields: resultV.rows.map(function (fieldDef) {
                    if (fieldDef.tipovar == null) {
                        throw new Error('la variable ' + fieldDef.variable + ' no tiene tipo');
                    }
                    return { name: fieldDef.variable, typeName: fieldDef.type_name };
                }),
                editable: context.user.rol === 'admin',
                primaryKey,
                sql: {
                    tableName: resultTD.row.tabla_datos,
                    isTable: true,
                    isReferable: true,
                    skipEnance: true
                },
            };
            var tableDefs = {};
            be.tableStructures[tableDef.name] = tableDefs[tableDef.name] = function (context) {
                return context.be.tableDefAdapt(tableDef, context);
            };
            // tableDefs[tableDef.name]=tableDef;
            var dump = await be.dumpDbSchemaPartial(tableDefs, {});
            var sqls = [ /* 'do $SQL_DUMP$\n begin'*/]
                .concat(dump.mainSql)
                .concat(dump.enancePart)
                .concat([ /* 'end\n$SQL_DUMP$'*/]);
            await context.client.query(sqls.join('\n')).execute();
            if (primaryKey.length) {
                return 'Listo. Tabla creada con ' + primaryKey.length + ' campos en la pk';
            }
            else {
                return 'ATENCION. Tabla creada sin pk';
            }
        }
    },
];
exports.ProceduresDatosExt = ProceduresDatosExt;
//# sourceMappingURL=procedures-datos-ext.js.map