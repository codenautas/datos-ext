export const defConfig=`
server:
  port: 3031
  base-url: /datos-ext
  session-store: memory
db:
  motor: postgresql
  host: localhost
  database: datos_ext_db
  schema: ext
  user: datos_ext_user
install:
  dump:
    db:
      owner: datos_ext_owner
    admin-can-create-tables: true
    scripts:
      post-adapt: 
      - para-install.sql
      - controlar_modificacion_generada.sql      
      - ../node_modules/pg-triggers/lib/recreate-his.sql
      - ../node_modules/pg-triggers/lib/table-changes.sql
      - ../node_modules/pg-triggers/lib/function-changes-trg.sql
      - ../node_modules/pg-triggers/lib/enance.sql
login:
  plus:
    loginForm:
      formTitle: Datos Ext
`;