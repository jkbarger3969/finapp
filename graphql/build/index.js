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
const apollo_server_core_1 = require("apollo-server-core");
const Koa = require("koa");
const http = require("http");
const resolvers_1 = require("./resolvers");
const secrets_1 = require("./secrets");
const mongoDb_1 = require("./mongoDb");
const schema_1 = require("./schema");
const mongodb_1 = require("mongodb");
const accountingDb_1 = require("./dataSources/accountingDb/accountingDb");
const schema_2 = require("@graphql-tools/schema");
const PORT = process.env.PORT || 4000;
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { DB_PASS, DB_USER } = yield (0, secrets_1.default)();
        const { DB_HOST, DB_PORT } = process.env;
        const { db, client } = yield (0, mongoDb_1.default)({
            dbHost: DB_HOST,
            dbPort: DB_PORT,
            dbUser: DB_USER,
            dbPass: DB_PASS,
            db: "accounting",
        });
        const context = {
            client,
            db,
            user: {
                id: new mongodb_1.ObjectId("5de16db089c4360df927a3db"),
            },
        };
        const httpServer = http.createServer();
        const schema = (0, schema_2.makeExecutableSchema)({
            typeDefs: schema_1.default,
            resolvers: resolvers_1.default,
        });
        const server = new apollo_server_koa_1.ApolloServer({
            schema,
            context: () => (Object.assign(Object.assign({}, context), { reqDateTime: new Date() })),
            dataSources: () => ({
                accountingDb: new accountingDb_1.AccountingDb({ client }),
            }),
            plugins: [(0, apollo_server_core_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
        });
        yield server.start();
        const app = new Koa();
        server.applyMiddleware({ app });
        httpServer.on("request", app.callback());
        yield new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
        console.log(`Graphql server ready at http://localhost:${PORT}${server.graphqlPath}`);
    }
    catch (e) {
        console.error(e);
    }
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLGFBQWEsRUFBRTtJQUMxQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7Q0FDNUI7QUFFRCx5REFBaUQ7QUFDakQsMkRBQXVFO0FBQ3ZFLDJCQUEyQjtBQUMzQiw2QkFBNkI7QUFFN0IsMkNBQW9DO0FBRXBDLHVDQUFnQztBQUNoQyx1Q0FBZ0M7QUFDaEMscUNBQWdDO0FBQ2hDLHFDQUFtQztBQUNuQywwRUFBdUU7QUFDdkUsa0RBQTZEO0FBRTdELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztBQUV0QyxDQUFDLEdBQVMsRUFBRTtJQUNWLElBQUk7UUFDRixNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sSUFBQSxpQkFBTyxHQUFFLENBQUM7UUFDN0MsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO1FBRXpDLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFBLGlCQUFPLEVBQUM7WUFDbkMsTUFBTSxFQUFFLE9BQU87WUFDZixNQUFNLEVBQUUsT0FBTztZQUNmLE1BQU0sRUFBRSxPQUFPO1lBQ2YsTUFBTSxFQUFFLE9BQU87WUFDZixFQUFFLEVBQUUsWUFBWTtTQUNqQixDQUFDLENBQUM7UUFFSCxNQUFNLE9BQU8sR0FBNEM7WUFDdkQsTUFBTTtZQUNOLEVBQUU7WUFDRixJQUFJLEVBQUU7Z0JBQ0osRUFBRSxFQUFFLElBQUksa0JBQVEsQ0FBQywwQkFBMEIsQ0FBQzthQUM3QztTQUNGLENBQUM7UUFFRixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFdkMsTUFBTSxNQUFNLEdBQUcsSUFBQSw2QkFBb0IsRUFBQztZQUNsQyxRQUFRLEVBQVIsZ0JBQVE7WUFDUixTQUFTLEVBQVQsbUJBQVM7U0FDVixDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxJQUFJLGdDQUFZLENBQUM7WUFDOUIsTUFBTTtZQUNOLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxpQ0FDVixPQUFPLEtBQ1YsV0FBVyxFQUFFLElBQUksSUFBSSxFQUFFLElBQ3ZCO1lBQ0YsV0FBVyxFQUFFLEdBQWdCLEVBQUUsQ0FBQyxDQUFDO2dCQUMvQixZQUFZLEVBQUUsSUFBSSwyQkFBWSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUM7YUFDM0MsQ0FBQztZQUNGLE9BQU8sRUFBRSxDQUFDLElBQUEsc0RBQWlDLEVBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1NBQzdELENBQUMsQ0FBQztRQUVILE1BQU0sTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRXJCLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFFdEIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFFaEMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFekMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQzVCLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsT0FBcUIsQ0FBQyxDQUN6RCxDQUFDO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FDVCw0Q0FBNEMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FDeEUsQ0FBQztLQUNIO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xCO0FBQ0gsQ0FBQyxDQUFBLENBQUMsRUFBRSxDQUFDIn0=