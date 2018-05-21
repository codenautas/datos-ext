import * as backendPlus from "backend-plus";
export interface TableContext extends backendPlus.Context {
    puede: object;
    superuser?: true;
    user: {
        rol: string;
    };
}
