# Mi Vaquita Backend

## Ejemplo de ataque de inyeccion SQL

Se modifica el metodo getById de grupos para ser inseguro y permitir
un ataque de inyeccion SQL.

El ataque consiste en borrar los datos de la tabla al consultar un grupo
por id.

### Pasos para replicar el ataque.

1. Crear una base de datos nueva, obivio.
2. Crear la tabla de grupos e insertar algunos con SQL.

```
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name varchar(30) NOT NULL,
    color varchar(7) NOT NULL
);

INSERT INTO groups (name, color)
VALUES  ('grupo 1', '#FF0000'),
        ('group 2', '#00FF00');

-- verificar
SELECT * FROM groups;
```

3. copiar el archivo `.env.example` a `.env` y definir los parametros de conexion a la nueva db.

4. Realizar la consulta /groups para ver la respuesta del backend.

```
>$ http GET localhost:3000/groups

HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 89
Content-Type: application/json; charset=utf-8
Date: Sun, 21 Apr 2024 17:16:43 GMT
ETag: W/"59-yoXePhkwzpmxcCbhnhgYXW6xWhQ"
Keep-Alive: timeout=5
X-Powered-By: Express

[
    {
        "color": "#00FF00",
        "id": 2,
        "name": "group 2"
    },
    {
        "color": "#FF0000",
        "id": 1,
        "name": "grupo 1"
    }
]
```

5. Realizar la consulta por id de cualquier grupo (no se realiza el ataque por ahora)

```
>$ http GET localhost:3000/groups/2

HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 43
Content-Type: application/json; charset=utf-8
Date: Sun, 21 Apr 2024 17:18:35 GMT
ETag: W/"2b-Kq/DQj7Cg2pLuLdlh4TplMaTZVA"
Keep-Alive: timeout=5
X-Powered-By: Express

{
    "color": "#00FF00",
    "id": 2,
    "name": "group 2"
}
```

6. Realizar el ataque SQL

Utilizar el siguiente URL: `'http://localhost:3000/groups/2;delete from groups'`

Notese las comillas del URL (si se usa postman creo que no son necesarias, en la linea de comandos si son necesarias)

```
>$ http GET 'localhost:3000/groups/2; delete from groups'

HTTP/1.1 500 Internal Server Error
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 61
Content-Type: application/json; charset=utf-8
Date: Sun, 21 Apr 2024 17:21:22 GMT
ETag: W/"3d-760D80I0HennV1z3Qn6EektTb+0"
Keep-Alive: timeout=5
X-Powered-By: Express

{
    "error": "Cannot read properties of undefined (reading '0')"
}
```

Un error 500? mira el registro del servidor en la consola de express...

```
--- ERROR ---
TypeError: Cannot read properties of undefined (reading '0')
    at Object.getById (file:///home/ksrarc/src/wwc/backendb/src/repositories/groups.repository.js:37:27)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async Object.getById (file:///home/ksrarc/src/wwc/backendb/src/services/groups.service.js:13:16)
    at async getById (file:///home/ksrarc/src/wwc/backendb/src/controllers/groups.controller.js:15:23)
    at async file:///home/ksrarc/src/wwc/backendb/src/lib/continue.decorator.js:4:13
```

Resulta que como se realizo una modificacion, la propiedad `result.rows` es `undefined` y la expression `result.rows[0]` genera la excepcion.

7. Consulta todos los grupos para ver el resultado

```
>$ http GET localhost:3000/groups

HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 2
Content-Type: application/json; charset=utf-8
Date: Sun, 21 Apr 2024 17:22:44 GMT
ETag: W/"2-l9Fw4VUO7kr8CvBlt4zaMCqXZ0w"
Keep-Alive: timeout=5
X-Powered-By: Express

[]

```

No hay nada! :open_mouth:

8. Arreglemos el problema de seguridad.

Cambia la implementacion la funcion de la persistencia.
`getById` en `src/persistence/groups.persistence.js` para que sea seguro.

```
const getById = async (id) => {
    const result = await dbClient.query(GET_BY_ID,[id]);
    return result.rows[0];
};
```

9. crea los grupos otra vez, consulta los grupos para ver un id.

```
INSERT INTO groups (name, color)
VALUES  ('grupo 1', '#FF0000'),
        ('group 2', '#00FF00');
```

```
>$ http GET localhost:3000/groups

HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 88
Content-Type: application/json; charset=utf-8
Date: Sun, 21 Apr 2024 17:35:16 GMT
ETag: W/"58-huQcpAB5k8QO743e8KYvnQBLJ5Q"
Keep-Alive: timeout=5
X-Powered-By: Express

[
    {
        "color": "#FF000",
        "id": 3,
        "name": "grupo 1"
    },
    {
        "color": "#00FF00",
        "id": 4,
        "name": "group 2"
    }
]
```

10. Intenta otra vez el ataque (el codigo seguro debe generar un error y prevenir el ataque)

```
>$ http GET 'localhost:3000/groups/3; delete from groups'

HTTP/1.1 500 Internal Server Error
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 76
Content-Type: application/json; charset=utf-8
Date: Sun, 21 Apr 2024 17:36:37 GMT
ETag: W/"4c-b4humUJxk+3flb10Qw4Sno6E/xc"
Keep-Alive: timeout=5
X-Powered-By: Express

{
    "error": "invalid input syntax for type integer: \"3; delete from groups\""
}
```

En la consola de express pasa lo siguente.

```
--- ERROR ---
error: invalid input syntax for type integer: "3; delete from groups"
    at /home/ksrarc/src/wwc/backendb/node_modules/pg/lib/client.js:526:17
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async Object.getById (file:///home/ksrarc/src/wwc/backendb/src/repositories/groups.repository.js:29:24)
    at async Object.getById (file:///home/ksrarc/src/wwc/backendb/src/services/groups.service.js:13:16)
    at async getById (file:///home/ksrarc/src/wwc/backendb/src/controllers/groups.controller.js:15:23)
    at async file:///home/ksrarc/src/wwc/backendb/src/lib/continue.decorator.js:4:13 {
  length: 164,
  severity: 'ERROR',
  code: '22P02',
  detail: undefined,
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: "unnamed portal parameter $1 = '...'",
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'numutils.c',
  line: '617',
  routine: 'pg_strtoint32_safe'
}
```

11. por si las moscas, consulta los grupos otra vez.

```
>$ http GET localhost:3000/groups

HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 88
Content-Type: application/json; charset=utf-8
Date: Sun, 21 Apr 2024 17:37:59 GMT
ETag: W/"58-huQcpAB5k8QO743e8KYvnQBLJ5Q"
Keep-Alive: timeout=5
X-Powered-By: Express

[
    {
        "color": "#FF000",
        "id": 3,
        "name": "grupo 1"
    },
    {
        "color": "#00FF00",
        "id": 4,
        "name": "group 2"
    }
]
```

No ha pasado nada, ataque prevenido!!! :smiley:


