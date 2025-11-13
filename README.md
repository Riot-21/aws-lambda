# Proyecto Serverless: AWS Lambda + DynamoDB (To-Do Endpoint)

## 1. Creación de la tabla DynamoDB

1. Entrar a la consola de **AWS → DynamoDB → Crear tabla**  
2. Configurar los siguientes valores:
   - **Nombre de la tabla:** `tec-practicantes-todo`
   - **Clave de partición (Partition key):** `id`  
     → Tipo: **String**
3. Dejar el resto con configuración predeterminada y crea la tabla.

---

## 2. Creación de la función Lambda

1. Ve a **AWS Lambda → Crear función**
2. Elige:
   - **Nombre:** `todoEndpoint`
   - **Tiempo de ejecución:** `Node.js 20.x`
   - Resto dejar sus valores por defecto y **Crear funcion**
3. En la sección de **Permisos**, otorga acceso a DynamoDB:
   - En la pestaña **Configuración → Permisos**, selecciona el rol asociado a tu función
   - Agrega la política **`AmazonDynamoDBFullAccess`**

---

## 3. Configuración local del proyecto

### 🔹 Clonar e instalar dependencias

```bash
git clone https://github.com/Riot-21/aws-lambda-todo.git
cd aws-lambda-todo
npm install
```

### 🔹 Compilar TypeScript a JavaScript

```cmd
npx tsc
```
Esto generará la carpeta /dist con el código compilado listo para AWS Lambda.

## 4. Empaquetar el proyecto (ZIP)

Desde la raíz del proyecto (donde está package.json):
```
Compress-Archive -Path dist, node_modules, package.json -DestinationPath aws-lambda-todo.zip
```

 Este comando genera el archivo aws-lambda-todo.zip que se subirá a AWS Lambda.

## 5. Subir el código a Lambda

1. Abre tu función todoEndpoint en la consola de AWS.

2. En la pestaña Código, selecciona Subir desde → Archivo .zip

3. Sube el archivo aws-lambda-todo.zip.

4. En Configuración del Tiempo de Ejecucion → Editar, cambia el valor a:

````
dist/index.handler
````
5. Guarda los cambios y despliega.

## 6. Crear API Gateway (HTTP API)

1. Ve a Amazon API Gateway → Crear API

2. Selecciona HTTP API

3. Crea nombre y asigna integracion **Integraciones -> Agregar integraciones -> Lambda -> Selecciona tu funcion lambda**

4. Agrega los siguientes métodos:

5. GET → Conecta con tu función Lambda todoEndpoint

6. POST → Conecta con tu función Lambda todoEndpoint

7. Guarda y despliega la API.

8. Copia el Endpoint URL que te genera (ejemplo:
https://abc123.execute-api.us-east-1.amazonaws.com)

## 7. Probar el endpoint (Postman o cURL)
###  GET — Listar tareas

#### Método: GET
URL: https://abc123.execute-api.us-east-1.amazonaws.com/todo

#### Respuesta esperada (200):
````json
[
  {
    "id": "a8c9d2b1-2fre-tdg4-56dfdg",
    "titulo": "Estudiar AWS Lambda",
    "completada": false
  }
]

````

### POST — Crear tarea

#### Método: POST
URL: https://abc123.execute-api.us-east-1.amazonaws.com/todo

Body (JSON):
````json
{
  "titulo": "Aprender DynamoDB"
}
````
#### Respuesta esperada (200):
````json
{
  "message": "Tarea creada correctamente",
  "tarea": {
    "id": "c82f73b0-1a9a-4b10-9c6b-6b53a3b6d1cb",
    "titulo": "Aprender DynamoDB",
    "completada": false
  }
}

````