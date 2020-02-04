"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
if (process.env.NODE_ENV === "development") {
    require('dotenv').config();
}
const apollo_server_koa_1 = require("apollo-server-koa");
const apollo_server_1 = require("apollo-server");
const Koa = require("koa");
const http = require("http");
const resolvers_1 = require("./resolvers");
const secrets_1 = require("./secrets");
const mongoDb_1 = require("./mongoDb");
const schema_1 = require("./schema");
const mongodb_1 = require("mongodb");
const PORT = process.env.PORT || 4000;
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { DB_PASS, DB_USER } = yield secrets_1.default();
        const { DB_HOST, DB_PORT } = process.env;
        const db = yield mongoDb_1.default({
            dbHost: DB_HOST,
            dbPort: DB_PORT,
            dbUser: DB_USER,
            dbPass: DB_PASS,
            db: 'accounting'
        });
        const nodeMap = yield db.collection('nodes').aggregate([
            { $addFields: { id: { $toString: "$_id" } } }
        ]).toArray()
            .then((nodes) => {
            const nodeTypesIdMap = new Map();
            const nodeTypesTypeMap = new Map();
            for (const node of nodes) {
                nodeTypesIdMap.set(node.id, node);
                nodeTypesTypeMap.set(node.typename, node);
            }
            return { id: nodeTypesIdMap, typename: nodeTypesTypeMap };
        });
        const context = {
            db,
            nodeMap,
            user: {
                id: new mongodb_1.ObjectID("5de16db089c4360df927a3db")
            },
            pubSub: new apollo_server_1.PubSub()
        };
        const gqlServer = new apollo_server_koa_1.ApolloServer({ typeDefs: schema_1.default, resolvers: resolvers_1.default, context });
        const gqlApp = new Koa();
        gqlServer.applyMiddleware({ app: gqlApp });
        const httpGQLServer = http.createServer(gqlApp.callback());
        gqlServer.installSubscriptionHandlers(httpGQLServer);
        httpGQLServer.listen(PORT, () => {
            console.log(`Graphql server ready at http://localhost:${PORT}${gqlServer.graphqlPath}`);
            console.log(`Subscriptions ready at ws://localhost:${PORT}${gqlServer.graphqlPath}`);
        });
    }
    catch (e) {
        console.error(e);
    }
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxJQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLGFBQWEsRUFBRTtJQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztDQUFFO0FBRTFFLHlEQUErQztBQUMvQyxpREFBdUM7QUFDdkMsMkJBQTJCO0FBQzNCLDZCQUE2QjtBQUU3QiwyQ0FBb0M7QUFFcEMsdUNBQWdDO0FBQ2hDLHVDQUFnQztBQUNoQyxxQ0FBZ0M7QUFDaEMscUNBQW1DO0FBRW5DLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztBQUV0QyxDQUFDLEdBQVEsRUFBRTtJQUVULElBQUk7UUFFRixNQUFNLEVBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxHQUFHLE1BQU0saUJBQU8sRUFBRSxDQUFDO1FBQzNDLE1BQU0sRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUV2QyxNQUFNLEVBQUUsR0FBRyxNQUFNLGlCQUFPLENBQUM7WUFDdkIsTUFBTSxFQUFDLE9BQU87WUFDZCxNQUFNLEVBQUMsT0FBTztZQUNkLE1BQU0sRUFBQyxPQUFPO1lBQ2QsTUFBTSxFQUFDLE9BQU87WUFDZCxFQUFFLEVBQUMsWUFBWTtTQUNoQixDQUFDLENBQUM7UUFFSCxNQUFNLE9BQU8sR0FBRyxNQUNkLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQy9CLEVBQUUsVUFBVSxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBQyxFQUFDLEVBQUM7U0FDeEMsQ0FBQyxDQUFDLE9BQU8sRUFBRTthQUNYLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBQyxFQUFFO1lBRWIsTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7WUFDbEQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBbUIsQ0FBQztZQUVwRCxLQUFJLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFFeEIsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNsQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUUxQztZQUVELE9BQU8sRUFBQyxFQUFFLEVBQUMsY0FBYyxFQUFFLFFBQVEsRUFBQyxnQkFBZ0IsRUFBQyxDQUFDO1FBRXhELENBQUMsQ0FBQyxDQUFDO1FBRUwsTUFBTSxPQUFPLEdBQVc7WUFDdEIsRUFBRTtZQUNGLE9BQU87WUFDUCxJQUFJLEVBQUM7Z0JBQ0gsRUFBRSxFQUFDLElBQUksa0JBQVEsQ0FBQywwQkFBMEIsQ0FBQzthQUM1QztZQUNELE1BQU0sRUFBQyxJQUFJLHNCQUFNLEVBQUU7U0FDcEIsQ0FBQztRQUVGLE1BQU0sU0FBUyxHQUFHLElBQUksZ0NBQVksQ0FBQyxFQUFFLFFBQVEsRUFBUixnQkFBUSxFQUFFLFNBQVMsRUFBVCxtQkFBUyxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQUM7UUFFcEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUN6QixTQUFTLENBQUMsZUFBZSxDQUFDLEVBQUMsR0FBRyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFeEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUUzRCxTQUFTLENBQUMsMkJBQTJCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFckQsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsNENBQTRDLElBQUksR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUN4RixPQUFPLENBQUMsR0FBRyxDQUFDLHlDQUF5QyxJQUFJLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDdkYsQ0FBQyxDQUFDLENBQUM7S0FHSjtJQUFDLE9BQU0sQ0FBQyxFQUFFO1FBRVQsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUVsQjtBQUVILENBQUMsQ0FBQSxDQUFDLEVBQUUsQ0FBQyJ9