"use strict";

import {html} from "js-to-html";
import * as myOwn from "myOwn";

function botonClientSideEnGrilla(opts: {nombreBoton: string, llamada: (depot:myOwn.Depot)=> Promise<any>}){
    return {
        prepare: function (depot:myOwn.Depot, fieldName: string) {
            var td = depot.rowControls[fieldName];
            var boton = html.button(opts.nombreBoton).create();
            td.buttonGenerar = boton;
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
                    boton.disabled=false;
                    boton.textContent='¡listo!';
                    boton.title=result;
                    boton.style.backgroundColor='#8F8';
                    var grid=depot.manager;
                    grid.retrieveRowAndRefresh(depot).then(function(){
                        setTimeout(restaurarBoton,3000);
                    },function(){
                        setTimeout(restaurarBoton,3000);
                    })
                }, function(err){
                    boton.textContent='error';
                    boton.style.backgroundColor='#FF8';
                    alertPromise(err.message).then(restaurarBoton,restaurarBoton);
                })
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


// myOwn.clientSides.generarTD = {
//     prepare:function(depot:myOwn.Depot, fieldName:string):void{
//         let td=depot.rowControls[fieldName];
//         let fileName=depot.row.nombre+'.'+depot.row.ext;
//         let bajar = html.a({href:'file?id_adjunto='+depot.row.id_adjunto, download:fileName},"bajar").create();
//         td.appendChild(bajar);
//     }
// }
