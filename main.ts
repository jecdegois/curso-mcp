import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { setErrorMap, z } from "zod";

// 1 Crear el servidor
// Es la interfaz principal con el protocolo MCP. Maneja la comunicación con el cliente y el servidor.

const server = new McpServer({
  name: "Demo",
  version: "1.0.0",
});

// 2 Definir las herramietas
// las herramienttas le permiten al llm realizar acciones a traves de tu servidor

server.tool(
  "fetch-weather", //Titulo de la herramienta
  "Tool to fetch the weather of a city", //Descripcion
  {
    city: z.string().describe("City name"),
  }, //parametros que puede recibir la herramienta
  async ({ city }) => {
    //lo que queremos que haga

    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=es&format=json`
    );

    const data = await response.json();

    if (data.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No se encontro la info de ${city}`,
          },
        ],
      };
    }

    const { latitude, longitude } = data.results[0];

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current=precipitation,temperature_2m,relative_humidity_2m`
    );

    const weatherData = await weatherResponse.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(weatherData, null, 2),
        },
      ],
    };
  }
);
server.tool(
  "Obtener_info_ciudad", //Titulo de la herramienta
  "Herramienta para obtener informacion de una ciudad", //Descripcion
  {
    city: z.string().describe("City name"),
  }, //parametros que puede recibir la herramienta
  async ({ city }) => {
    //lo que queremos que haga

    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=es&format=json`
    );

    const data = await response.json();

    if (data.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No se encontro la info de ${city}`,
          },
        ],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

//3. Escuchar las conexiones del cliente

const transport = new StdioServerTransport();

await server.connect(transport);
