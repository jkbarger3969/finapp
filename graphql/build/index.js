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
        const { db, client } = yield mongoDb_1.default({
            dbHost: DB_HOST,
            dbPort: DB_PORT,
            dbUser: DB_USER,
            dbPass: DB_PASS,
            db: "accounting",
        });
        const nodeMap = yield db
            .collection("nodes")
            .aggregate([{ $addFields: { id: { $toString: "$_id" } } }])
            .toArray()
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
            client,
            db,
            nodeMap,
            user: {
                id: new mongodb_1.ObjectId("5de16db089c4360df927a3db"),
            },
            pubSub: new apollo_server_1.PubSub(),
        };
        const gqlServer = new apollo_server_koa_1.ApolloServer({
            typeDefs: schema_1.default,
            resolvers: resolvers_1.default,
            context,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLGFBQWEsRUFBRTtJQUMxQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7Q0FDNUI7QUFFRCx5REFBaUQ7QUFDakQsaURBQXVDO0FBQ3ZDLDJCQUEyQjtBQUMzQiw2QkFBNkI7QUFFN0IsMkNBQW9DO0FBRXBDLHVDQUFnQztBQUNoQyx1Q0FBZ0M7QUFDaEMscUNBQWdDO0FBQ2hDLHFDQUFtQztBQUVuQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7QUFFdEMsQ0FBQyxHQUFTLEVBQUU7SUFDVixJQUFJO1FBQ0YsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxNQUFNLGlCQUFPLEVBQUUsQ0FBQztRQUM3QyxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFFekMsTUFBTSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLGlCQUFPLENBQUM7WUFDbkMsTUFBTSxFQUFFLE9BQU87WUFDZixNQUFNLEVBQUUsT0FBTztZQUNmLE1BQU0sRUFBRSxPQUFPO1lBQ2YsTUFBTSxFQUFFLE9BQU87WUFDZixFQUFFLEVBQUUsWUFBWTtTQUNqQixDQUFDLENBQUM7UUFFSCxNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUU7YUFDckIsVUFBVSxDQUFDLE9BQU8sQ0FBQzthQUNuQixTQUFTLENBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUMxRCxPQUFPLEVBQUU7YUFDVCxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNkLE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1lBQ25ELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQW9CLENBQUM7WUFFckQsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7Z0JBQ3hCLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDbEMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDM0M7WUFFRCxPQUFPLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQztRQUM1RCxDQUFDLENBQUMsQ0FBQztRQUVMLE1BQU0sT0FBTyxHQUFZO1lBQ3ZCLE1BQU07WUFDTixFQUFFO1lBQ0YsT0FBTztZQUNQLElBQUksRUFBRTtnQkFDSixFQUFFLEVBQUUsSUFBSSxrQkFBUSxDQUFDLDBCQUEwQixDQUFDO2FBQzdDO1lBQ0QsTUFBTSxFQUFFLElBQUksc0JBQU0sRUFBRTtTQUNyQixDQUFDO1FBRUYsTUFBTSxTQUFTLEdBQUcsSUFBSSxnQ0FBWSxDQUFDO1lBQ2pDLFFBQVEsRUFBUixnQkFBUTtZQUNSLFNBQVMsRUFBVCxtQkFBUztZQUNULE9BQU87U0FDUixDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLFNBQVMsQ0FBQyxlQUFlLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUUzQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRTNELFNBQVMsQ0FBQywyQkFBMkIsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVyRCxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUU7WUFDOUIsT0FBTyxDQUFDLEdBQUcsQ0FDVCw0Q0FBNEMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FDM0UsQ0FBQztZQUNGLE9BQU8sQ0FBQyxHQUFHLENBQ1QseUNBQXlDLElBQUksR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQ3hFLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztLQUNKO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xCO0FBQ0gsQ0FBQyxDQUFBLENBQUMsRUFBRSxDQUFDIn0=