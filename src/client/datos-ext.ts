"use strict";

import {html} from "js-to-html";
// TODO: esto debería ir en datos-ext
import * as myOwn from "myOwn";

function botonClientSideEnGrilla(opts: {nombreBoton: string, llamada: (depot:myOwn.Depot)=> Promise<any>}){
    return {
        prepare: function (depot:myOwn.Depot, fieldName: string) {
            if (depot.row.tipo == 'externa'){
                var td = depot.rowControls[fieldName];
                var boton = html.button(opts.nombreBoton).create();
                td.innerHTML = "";
                td.appendChild(boton);
                var restaurarBoton = function(){
                    boton.disabled=false;
                    boton.textContent=opts.nombreBoton;
                    boton.style.backgroundColor='';
                }
                boton.onclick=function(){
                    boton.disabled=true;
                    boton.textContent='procesando...';
                    opts.llamada(depot).then(function(result){
                        // boton.disabled=false;
                        boton.textContent='¡listo!';
                        boton.title=result;
                        boton.style.backgroundColor='#8F8';
                        var grid=depot.manager;
                        grid.retrieveRowAndRefresh(depot).then(function(){
                            // setTimeout(restaurarBoton,3000);
                        },function(){
                            // setTimeout(restaurarBoton,3000);
                        })
                    }, function(err){
                        boton.textContent='error';
                        boton.style.backgroundColor='#FF8';
                        alertPromise(err.message).then(restaurarBoton,restaurarBoton);
                    })
                }
            }
        }
    };
}
myOwn.clientSides.generarTD = botonClientSideEnGrilla({
    nombreBoton:'generar',
    llamada:function(depot: myOwn.Depot){
        return myOwn.ajax.tabla_datos.generar({
            operativo: depot.row.operativo,
            tabla_datos  : depot.row.tabla_datos
        });
    }
});
