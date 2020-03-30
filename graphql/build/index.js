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
    require("dotenv").config();
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
            db: "accounting"
        });
        const nodeMap = yield db
            .collection("nodes")
            .aggregate([{ $addFields: { id: { $toString: "$_id" } } }])
            .toArray()
            .then(nodes => {
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
        const gqlServer = new apollo_server_koa_1.ApolloServer({
            typeDefs: schema_1.default,
            resolvers: resolvers_1.default,
            context
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLGFBQWEsRUFBRTtJQUMxQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7Q0FDNUI7QUFFRCx5REFBaUQ7QUFDakQsaURBQXVDO0FBQ3ZDLDJCQUEyQjtBQUMzQiw2QkFBNkI7QUFFN0IsMkNBQW9DO0FBRXBDLHVDQUFnQztBQUNoQyx1Q0FBZ0M7QUFDaEMscUNBQWdDO0FBQ2hDLHFDQUFtQztBQUVuQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7QUFFdEMsQ0FBQyxHQUFTLEVBQUU7SUFDVixJQUFJO1FBQ0YsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxNQUFNLGlCQUFPLEVBQUUsQ0FBQztRQUM3QyxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFFekMsTUFBTSxFQUFFLEdBQUcsTUFBTSxpQkFBTyxDQUFDO1lBQ3ZCLE1BQU0sRUFBRSxPQUFPO1lBQ2YsTUFBTSxFQUFFLE9BQU87WUFDZixNQUFNLEVBQUUsT0FBTztZQUNmLE1BQU0sRUFBRSxPQUFPO1lBQ2YsRUFBRSxFQUFFLFlBQVk7U0FDakIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFO2FBQ3JCLFVBQVUsQ0FBQyxPQUFPLENBQUM7YUFDbkIsU0FBUyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDMUQsT0FBTyxFQUFFO2FBQ1QsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ1osTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQW9CLENBQUM7WUFDbkQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBb0IsQ0FBQztZQUVyRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDeEIsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNsQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUMzQztZQUVELE9BQU8sRUFBRSxFQUFFLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDO1FBQzVELENBQUMsQ0FBQyxDQUFDO1FBRUwsTUFBTSxPQUFPLEdBQVk7WUFDdkIsRUFBRTtZQUNGLE9BQU87WUFDUCxJQUFJLEVBQUU7Z0JBQ0osRUFBRSxFQUFFLElBQUksa0JBQVEsQ0FBQywwQkFBMEIsQ0FBQzthQUM3QztZQUNELE1BQU0sRUFBRSxJQUFJLHNCQUFNLEVBQUU7U0FDckIsQ0FBQztRQUVGLE1BQU0sU0FBUyxHQUFHLElBQUksZ0NBQVksQ0FBQztZQUNqQyxRQUFRLEVBQVIsZ0JBQVE7WUFDUixTQUFTLEVBQVQsbUJBQVM7WUFDVCxPQUFPO1NBQ1IsQ0FBQyxDQUFDO1FBRUgsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUN6QixTQUFTLENBQUMsZUFBZSxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFFM0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUUzRCxTQUFTLENBQUMsMkJBQTJCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFckQsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQ1QsNENBQTRDLElBQUksR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQzNFLENBQUM7WUFDRixPQUFPLENBQUMsR0FBRyxDQUNULHlDQUF5QyxJQUFJLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUN4RSxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNsQjtBQUNILENBQUMsQ0FBQSxDQUFDLEVBQUUsQ0FBQyJ9