/// <reference types="backend-plus" />
import { ProcedureContext } from "backend-plus";
declare var ProceduresDatosExt: {
    action: string;
    parameters: {
        name: string;
        typeName: string;
        references: string;
    }[];
    coreFunction: (context: ProcedureContext, parameters: {
        operativo: string;
        origen: string;
    }) => Promise<any>;
}[];
export = ProceduresDatosExt;
