if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

import { ApolloServer } from "apollo-server-koa";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import Koa from "koa";
import * as http from "http";
import { graphqlUploadKoa } from "graphql-upload";

import resolvers from "./resolvers";
import { Context, DataSources } from "./types";
import secrets from "./secrets";
import mongoDb from "./mongoDb";
import typeDefs from "./schema";
import { ObjectId } from "mongodb";
import { AccountingDb } from "./dataSources/accountingDb/accountingDb";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { createLoaders } from "./loaders";
import { AuthService } from "./services/authService";

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    const { DB_PASS, DB_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = await secrets();
    const DB_HOST = process.env.DB_HOST || "localhost";
    const DB_PORT = process.env.DB_PORT || "27017";

    const { db, client } = await mongoDb({
      dbHost: DB_HOST,
      dbPort: DB_PORT,
      dbUser: DB_USER,
      dbPass: DB_PASS,
      db: "accounting",
    });

    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ googleId: 1 }, { sparse: true });
    await db.collection("userPermissions").createIndex({ userId: 1, departmentId: 1 }, { unique: true });
    await db.collection("auditLog").createIndex({ userId: 1 });
    await db.collection("auditLog").createIndex({ timestamp: -1 });

    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 
      (process.env.NODE_ENV === "production" 
        ? "https://yourdomain.com/login"
        : "http://localhost:5173/login");

    let authService: AuthService | undefined;
    if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
      authService = new AuthService(db, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);
      console.log("Auth service initialized");
    } else {
      console.warn("Warning: Google OAuth credentials not configured. Auth disabled.");
    }

    const httpServer = http.createServer();

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    const server = new ApolloServer({
      schema,
      context: ({ ctx }): Context<undefined> => {
        const authorization = ctx?.request?.headers?.authorization || "";
        const token = authorization.replace("Bearer ", "");

        let user: { id: ObjectId } | undefined;

        if (token && authService) {
          const payload = authService.verifyToken(token);
          if (payload) {
            user = { id: new ObjectId(payload.userId) };
          }
        }

        if (!user && process.env.NODE_ENV === "development" && !authService) {
          user = { id: new ObjectId("5de16db089c4360df927a3db") };
        }

        return {
          client,
          db,
          user,
          reqDateTime: new Date(),
          loaders: createLoaders(db),
          authService,
          ipAddress: ctx?.request?.ip,
          userAgent: ctx?.request?.headers?.["user-agent"],
        };
      },
      dataSources: (): DataSources => ({
        accountingDb: new AccountingDb({ client }),
      }),
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await server.start();

    const app = new Koa();

    app.use(graphqlUploadKoa({ maxFileSize: 10000000, maxFiles: 10 }));

    server.applyMiddleware({ app });

    httpServer.on("request", app.callback());

    await new Promise((resolve) =>
      httpServer.listen({ port: PORT }, resolve as () => void)
    );

    console.log(
      `Graphql server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
  } catch (e) {
    console.error(e);
  }
})();
