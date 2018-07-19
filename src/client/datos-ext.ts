"use strict";

/*
var my = myOwn;

function botonClientSideEnGrilla(opts){
    return {
        prepare: function (depot, fieldName) {
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



my.clientSides.generarPanel = botonClientSideEnGrilla({
    nombreBoton:'generar',
    llamada:function(depot){
        return my.ajax.tabla_datos.generar({
            operativo: depot.row.operativo,
            tabla_datos  : depot.row.tabla_datos
        });
    }
});

*/