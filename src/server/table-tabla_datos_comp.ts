"use strict";

import {TableDefinition} from "backend-plus"
import {TableContext} from "./types-datos-ext";

export function tabla_datos_comp(context:TableContext):TableDefinition{
    const admin=context.user.rol==='admin';
    const esquema=context.be.db.quoteLiteral('defgen');
    return {
        name:'tabla_datos_comp',
        elementName:'comparación de columna',
        editable:admin,
        fields:[
            {name:"operativo"         , typeName:'text', nullable: false},
            {name:"tabla_datos"       , typeName:'text', nullable: false},
            {name:"variable"          , typeName:'text', nullable: false},
            {name:"estado"            , typeName:'text'                 },
            {name:"data_type"         , typeName:'text'                 },
            {name:"pk_position"       , typeName:'bigint'               },
            {name:"ordinal_position"  , typeName:'bigint'               },
            {name:"column_default"    , typeName:'text'                 },
            {name:"is_nullable"       , typeName:'text'                 },
            {name:"abr"               , typeName:'text'                 },
            {name:"nombre"            , typeName:'text'                 },
            {name:"tipovar"           , typeName:'text'                 },
            {name:"clase"             , typeName:'text'                 },
            {name:"es_pk"             , typeName:'bigint'               },
            {name:"es_nombre_unico"   , typeName:'boolean'              },
            {name:"activa"            , typeName:'boolean'              },
            {name:"filtro"            , typeName:'text'                 },
            {name:"expresion"         , typeName:'text'                 },
            {name:"cascada"           , typeName:'text'                 },
            {name:"nsnc_atipico"      , typeName:'bigint'               },
            {name:"cerrada"           , typeName:'boolean'              },
            {name:"funcion_agregacion", typeName:'text'                 },
            {name:"tabla_agregada"    , typeName:'text'                 },
            {name:"grupo"             , typeName:'text'                 },
            {name:"orden"             , typeName:'bigint'               },
        ],
        primaryKey:['operativo', 'tabla_datos', 'variable'],
        softForeignKeys:[
            {references:'operativos' , fields:['operativo']},
            {references:'tabla_datos', fields:['operativo', 'tabla_datos']},
        ],
        sql:{
            isTable:false,
            from:`(
                select t.operativo, t.tabla_datos, variable, 
                    case 
                        when c.variable is null then 'falta' 
                        when v.variable is null then 'sobra' 
                        when v.es_pk is distinct from c.pk_position then 'pk dif'
                        when v.type_name <> c.data_type then case when v.validar in ('numerico', 'opciones') then 'numero dif' else 'tipos dif' end
                        else null 
                    end as estado,
                    c.data_type, c.pk_position, c.ordinal_position, c.column_default, c.is_nullable, 
                    abr, nombre, tipovar, clase, v.es_pk, es_nombre_unico, activa, filtro, expresion, cascada, 
                    nsnc_atipico, cerrada, funcion_agregacion, tabla_agregada, grupo, orden
                from tabla_datos t 
                    left join information_schema.table_constraints tc 
                        on tc.table_schema=${esquema} and tc.table_name=t.tabla_datos and tc.constraint_type = 'PRIMARY KEY',
                    lateral (
                        select * 
                            from variables v 
                                left join tipovar tv using(tipovar) 
                            where v.operativo=t.operativo and v.tabla_datos=t.tabla_datos
                    ) v
                    full outer join
                    lateral (
                    select c.*, c.column_name as variable, kcu.ordinal_position as pk_position
                        from information_schema.columns c 
                            left join information_schema.key_column_usage AS kcu 
                                on kcu.constraint_schema = tc.constraint_schema and kcu.constraint_name = tc.constraint_name and kcu.column_name = c.column_name
                        where c.table_schema=${esquema} and c.table_name=t.tabla_datos
                    ) c using (variable)
            )`
        }
    };
}