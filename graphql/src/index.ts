if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

import { ApolloServer } from "apollo-server-koa";
import { PubSub } from "apollo-server";
import * as Koa from "koa";
import * as http from "http";

import resolvers from "./resolvers";
import { NodeInfo, Context } from "./types";
import secrets from "./secrets";
import mongoDb from "./mongoDb";
import typeDefs from "./schema";
import { ObjectId } from "mongodb";

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

    const nodeMap = await db
      .collection("nodes")
      .aggregate([{ $addFields: { id: { $toString: "$_id" } } }])
      .toArray()
      .then((nodes) => {
        const nodeTypesIdMap = new Map<string, NodeInfo>();
        const nodeTypesTypeMap = new Map<string, NodeInfo>();

        for (const node of nodes) {
          nodeTypesIdMap.set(node.id, node);
          nodeTypesTypeMap.set(node.typename, node);
        }

        return { id: nodeTypesIdMap, typename: nodeTypesTypeMap };
      });

    const context: Context = {
      client,
      db,
      nodeMap,
      user: {
        id: new ObjectId("5de16db089c4360df927a3db"),
      },
      pubSub: new PubSub(),
    };

    const gqlServer = new ApolloServer({
      typeDefs,
      resolvers,
      context: () => ({
        ...context,
      }),
    });

    const gqlApp = new Koa();
    gqlServer.applyMiddleware({ app: gqlApp });

    const httpGQLServer = http.createServer(gqlApp.callback());

    gqlServer.installSubscriptionHandlers(httpGQLServer);

    httpGQLServer.listen(PORT, () => {
      console.log(
        `Graphql server ready at http://localhost:${PORT}${gqlServer.graphqlPath}`
      );
      console.log(
        `Subscriptions ready at ws://localhost:${PORT}${gqlServer.graphqlPath}`
      );
    });
  } catch (e) {
    console.error(e);
  }
})();
