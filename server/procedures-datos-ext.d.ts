import { ProcedureContext } from "operativos";
declare type TablaDatosGenerarParameters = {
    operativo: string;
    tabla_datos: string;
};
declare var ProceduresDatosExt: {
    action: string;
    parameters: {
        name: string;
        typeName: string;
        references: string;
    }[];
    coreFunction: (context: ProcedureContext, parameters: TablaDatosGenerarParameters) => Promise<string>;
}[];
export { ProceduresDatosExt };
