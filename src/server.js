import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import { getUserFromToken } from "./utils/jwt.js";
import { createTaskLoader } from "./dataloaders/taskLoader.js";
import { createUserLoader } from "./dataloaders/userLoader.js";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";

await connectDB();

async function startServer() {
  const app = express();

  const httpServer = createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  useServer(
    {
      schema,
      context: async (ctx) => {
        const authHeader = ctx.connectionParams?.authorization;

        if (!authHeader) {
          return {
            user: null,
          };
        }

        const token = authHeader.replace("Bearer ", "");

        return {
          user: getUserFromToken(token),
        };
      },
    },
    wsServer,
  );

  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return {
            user: null,
            taskLoader: createTaskLoader(),
            userLoader: createUserLoader(),
          };
        }
        const token = authHeader.replace("Bearer ", "");
        return {
          user: getUserFromToken(token),
          taskLoader: createTaskLoader(),
          userLoader: createUserLoader(),
        };
      },
    }),
  );

  httpServer.listen(8080, () => {
    console.log("Server started at port 8080");
  });
}

startServer();
