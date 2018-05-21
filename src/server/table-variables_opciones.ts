"use strict";

import {TableContext} from "./types-datos-ext"

module.exports = function (context:TableContext) {
    var admin = context.user.rol === 'admin';
    return context.be.tableDefAdapt({
        name: 'variables_opciones',
        elementName: 'opción de variable',
        editable: admin,
        fields: [
            { name: "operativo"           , typeName: 'text'    },
            { name: "variable"            , typeName: 'text'    },
            { name: "opcion"              , typeName: 'integer' },
            { name: "nombre"              , typeName: 'text'    },
            { name: "expresion_condicion" , typeName: 'text'    },
            { name: "expresion_valor"     , typeName: 'text'    },
            { name: "orden"               , typeName: 'integer' },
        ],
        primaryKey: ['operativo', 'variable','opcion'],
        foreignKeys: [
            {references:'variables'      , fields:['operativo','variable']      },
        ],
        constraints: [
        ],
    }, context);
}
