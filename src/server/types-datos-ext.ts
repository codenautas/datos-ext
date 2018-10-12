import {TablaDatos} from 'operativos';
import { AppDatosExt } from './app-datos-ext';

export * from 'operativos';

export type AppDatosExtType = InstanceType<typeof AppDatosExt>;

export class TablaDatoExterna extends TablaDatos{
    estructura_cerrada: boolean

}
