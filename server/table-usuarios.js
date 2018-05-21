"use strict";

module.exports = function(context){
    var admin = context.user.rol==='admin';
    return context.be.tableDefAdapt({
        name:'usuarios',
        title:'Usuarios de la Aplicación',
        editable:admin,
        fields:[
            {name:'usuario'          , typeName:'text'   , nullable:false },
            {name:'rol'              , typeName:'text'                    },
            {name:'clave'            , typeName:'text'    , allow:{select:context.forDump} },
            {name:'activo'           , typeName:'boolean' , nullable:false   ,defaultValue:false},
            {name:'nombre'           , typeName:'text'                    },
            {name:'apellido'         , typeName:'text'                    },
            {name:'interno'          , typeName:'text'                    },
            {name:'mail'             , typeName:'text'                    },
            {name:'mail_alternativo' , typeName:'text'                    },
            {name:'clave_nueva'      , typeName:'text', clientSide:'newPass', allow:{select:admin, update:true, insert:false}},
        ],
        primaryKey:['usuario'],
        sql:{
            where:admin?'true':"usuario = "+context.be.db.quoteText(context.user.usuario)
        }
    },context);
}
