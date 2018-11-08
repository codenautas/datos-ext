--set search_path=procesamiento;
CREATE OR REPLACE FUNCTION controlar_modificacion_generada_trg()
  RETURNS trigger AS
$BODY$
DECLARE
    v_tabla_datos        TEXT;
    v_operativo          TEXT;
    v_generada DATE;
    v_tipo               text;
    v_texto_op           text;
    v_texto_obj          text;
    v_registro_salida    RECORD;
    
BEGIN
CASE TG_TABLE_NAME
    WHEN 'tabla_datos' THEN
        v_tabla_datos=OLD.tabla_datos;
        v_operativo  =OLD.operativo;        
        IF OLD.generada IS NOT NULL and OLD.tipo='externa'  THEN
            RAISE EXCEPTION 'ERROR no se puede modificar tabla_datos % del operativo %. Porque ya fue generado', v_tabla_datos, v_operativo;
        END IF;
        RETURN NEW;
        --no controlo borrado
    WHEN 'variables', 'variables_opciones' THEN
        IF TG_TABLE_NAME='variables' THEN
           v_texto_obj='variable';
        ELSE
           v_texto_obj='opcion';
        END IF;
        CASE TG_OP
            WHEN 'INSERT' THEN
                v_texto_op= 'agregar ';
                v_registro_salida=NEW;
                v_tabla_datos=new.tabla_datos;
                v_operativo  =new.operativo;                
            WHEN 'UPDATE' THEN
                v_texto_op= 'modificar ';
                v_registro_salida=NEW;
                v_tabla_datos=old.tabla_datos;
                v_operativo  =old.operativo;                
            ELSE
                v_texto_op= 'borrar ';
                v_registro_salida=OLD;
                v_tabla_datos=old.tabla_datos;
                v_operativo  =old.operativo;                                
        END CASE;
        SELECT generada , tipo
            INTO v_generada, v_tipo
            FROM tabla_datos
            WHERE operativo=v_operativo AND tabla_datos=v_tabla_datos;                
        IF v_generada IS NOT NULL and v_tipo='externa' THEN    
            RAISE EXCEPTION 'ERROR no se puede % % , la tabla de datos  "%" externa del operativo % ya fue generada', v_texto_op,v_texto_obj,v_tabla_datos, v_operativo;
        END IF;
        RETURN v_registro_salida;
    ELSE
        RAISE EXCEPTION 'ERROR Tabla "%" no considerada en "controlar_modificacion_generada_trg"',TG_TABLE_NAME;
END CASE;
END;
$BODY$
  LANGUAGE plpgsql ;
--ALTER FUNCTION controlar_modificacion_generada_trg()
--  OWNER TO procesamiento_owner; 


CREATE TRIGGER variables_controlar_modificacion_generada_trg
  BEFORE UPDATE OR INSERT OR DELETE
  ON variables
  FOR EACH ROW
  EXECUTE PROCEDURE controlar_modificacion_generada_trg();
  
CREATE TRIGGER var_opciones_controlar_modificacion_generada_trg
  BEFORE UPDATE OR INSERT OR DELETE
  ON variables_opciones
  FOR EACH ROW
  EXECUTE PROCEDURE controlar_modificacion_generada_trg();

CREATE TRIGGER tabla_datos_controlar_modificacion_generada_trg
  BEFORE UPDATE
  ON tabla_datos
  FOR EACH ROW
  EXECUTE PROCEDURE controlar_modificacion_generada_trg();

