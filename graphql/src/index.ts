if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

import { ApolloServer } from "apollo-server-koa";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import * as Koa from "koa";
import * as http from "http";

import resolvers from "./resolvers";
import { Context, DataSources } from "./types";
import secrets from "./secrets";
import mongoDb from "./mongoDb";
import typeDefs from "./schema";
import { ObjectId } from "mongodb";
import { AccountingDb } from "./dataSources/accountingDb/accountingDb";
import { makeExecutableSchema } from "@graphql-tools/schema";

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    const { DB_PASS, DB_USER } = await secrets();
    const { DB_HOST, DB_PORT } = process.env;

    const { db, client } = await mongoDb({
      dbHost: DB_HOST,
      dbPort: DB_PORT,
      dbUser: DB_USER,
      dbPass: DB_PASS,
      db: "accounting",
    });

    const context: Omit<Context<undefined>, "reqDateTime"> = {
      client,
      db,
      user: {
        id: new ObjectId("5de16db089c4360df927a3db"),
      },
    };

    const httpServer = http.createServer();

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    const server = new ApolloServer({
      schema,
      context: () => ({
        ...context,
        reqDateTime: new Date(),
      }),
      dataSources: (): DataSources => ({
        accountingDb: new AccountingDb({ client }),
      }),
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await server.start();

    const app = new Koa();

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
