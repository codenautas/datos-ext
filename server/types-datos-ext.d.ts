import * as backendPlus from "backend-plus";
export interface TableContext extends backendPlus.Context {
    puede: object;
    superuser?: true;
    user: {
        rol: string;
    };
}
export declare type VariablesOpciones = {
    operativo: string;
    variable: string;
    opcion: number;
    nombre: string;
    expresion_condicion: string;
    expresion_valor: string;
    orden: number;
};
export declare type Variables = {
    operativo: string;
    origen: string;
    variable: string;
    abr: string;
    nombre: string;
    tipovar: string;
    activa: boolean;
    expresion: string;
    clase: string;
    cascada: string;
    nsnc_atipico: number;
    cerrada: boolean;
    funcion_agregacion: string;
    tabla_agregada: string;
};
