import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  ScanCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface Tarea {
  id: string,
  titulo: string,
  completada: boolean
}

export const handler = async (
  event: APIGatewayProxyEventV2, 
  context: Context): Promise<APIGatewayProxyResultV2> => {

  const method = event.requestContext?.http?.method || "UNKNOWN";

  try {
    switch (method) {
      case "GET":
        return await handleGetRequest();
        break;
      case "POST":
        return await handlePostRequest(event);
        break;
      default:
        return {
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
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Error interno del servidor",
        error: ( error as Error).message,
      }),
    };
  }
};

const handleGetRequest = async (): Promise<APIGatewayProxyResultV2> => {
  const command = new ScanCommand({
    TableName: "tec-practicantes-todo",
  });

  const response = await docClient.send(command);
  const items = response.Items as Tarea[] | undefined;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(response.Items ?? []),
  };
};

const handlePostRequest = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const body = event.body ? JSON.parse(event.body) : {};

  if (!body.titulo || typeof body.titulo !== "string" || body.titulo.trim()==="") {
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
