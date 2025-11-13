import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  ScanCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event, context) => {
  let response;
  const method = event.requestContext.http.method || "UNKNOWN";

  try {
    switch (method) {
      case "GET":
        response = await handleGetRequest();
        break;
      case "POST":
        response = await handlePostRequest(event);
        break;
      default:
        response = {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "Método no permitido",
            event: event,
            context: context,
          }),
        };
    }
  } catch (error) {
    console.error("Error:", error);
    response = {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Error interno del servidor",
        error: error.message,
      }),
    };
  }

  return response;
};

const handleGetRequest = async () => {
  const command = new ScanCommand({
    TableName: "tec-practicantes-todo",
  });

  const response = await docClient.send(command);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(response.Items ?? []),
  };
};

const handlePostRequest = async (event) => {
  const body = JSON.parse(event.body || "{}");

  if (!body.titulo || typeof body.titulo !== "string") {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "El campo 'titulo' es obligatorio y debe ser de tipo string.",
      }),
    };
  }

  const nuevaTarea = {
    id: randomUUID(),
    titulo: body.titulo,
    completada: false,
  };

  const command = new PutCommand({
    TableName: "tec-practicantes-todo",
    Item: nuevaTarea,
  });

  await docClient.send(command);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Tarea creada correctamente",
      tarea: nuevaTarea,
    }),
  };
};
