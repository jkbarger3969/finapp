"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
if (process.env.NODE_ENV === "development") {
    require("dotenv").config();
}
const apollo_server_koa_1 = require("apollo-server-koa");
const apollo_server_core_1 = require("apollo-server-core");
const koa_1 = __importDefault(require("koa"));
const http = __importStar(require("http"));
const graphql_upload_1 = require("graphql-upload");
const resolvers_1 = __importDefault(require("./resolvers"));
const secrets_1 = __importDefault(require("./secrets"));
const mongoDb_1 = __importDefault(require("./mongoDb"));
const schema_1 = __importDefault(require("./schema"));
const mongodb_1 = require("mongodb");
const accountingDb_1 = require("./dataSources/accountingDb/accountingDb");
const schema_2 = require("@graphql-tools/schema");
const loaders_1 = require("./loaders");
const authService_1 = require("./services/authService");
const PORT = process.env.PORT || 4000;
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { DB_PASS, DB_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = yield (0, secrets_1.default)();
        const DB_HOST = process.env.DB_HOST || "localhost";
        const DB_PORT = process.env.DB_PORT || "27017";
        const { db, client } = yield (0, mongoDb_1.default)({
            dbHost: DB_HOST,
            dbPort: DB_PORT,
            dbUser: DB_USER,
            dbPass: DB_PASS,
            db: "accounting",
        });
        yield db.collection("users").createIndex({ email: 1 }, { unique: true });
        yield db.collection("users").createIndex({ googleId: 1 }, { sparse: true });
        yield db.collection("userPermissions").createIndex({ userId: 1, departmentId: 1 }, { unique: true });
        yield db.collection("auditLog").createIndex({ userId: 1 });
        yield db.collection("auditLog").createIndex({ timestamp: -1 });
        const redirectUri = process.env.GOOGLE_REDIRECT_URI ||
            (process.env.NODE_ENV === "production"
                ? "https://yourdomain.com/login"
                : "http://localhost:5173/login");
        let authService;
        if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
            authService = new authService_1.AuthService(db, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);
            console.log("Auth service initialized");
        }
        else {
            console.warn("Warning: Google OAuth credentials not configured. Auth disabled.");
        }
        const httpServer = http.createServer();
        const schema = (0, schema_2.makeExecutableSchema)({
            typeDefs: schema_1.default,
            resolvers: resolvers_1.default,
        });
        const server = new apollo_server_koa_1.ApolloServer({
            schema,
            context: ({ ctx }) => {
                var _a, _b, _c, _d, _e;
                const authorization = ((_b = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.request) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b.authorization) || "";
                const token = authorization.replace("Bearer ", "");
                let user;
                if (token && authService) {
                    const payload = authService.verifyToken(token);
                    if (payload) {
                        user = { id: new mongodb_1.ObjectId(payload.userId) };
                    }
                }
                if (!user && process.env.NODE_ENV === "development" && !authService) {
                    user = { id: new mongodb_1.ObjectId("5de16db089c4360df927a3db") };
                }
                return {
                    client,
                    db,
                    user,
                    reqDateTime: new Date(),
                    loaders: (0, loaders_1.createLoaders)(db),
                    authService,
                    ipAddress: (_c = ctx === null || ctx === void 0 ? void 0 : ctx.request) === null || _c === void 0 ? void 0 : _c.ip,
                    userAgent: (_e = (_d = ctx === null || ctx === void 0 ? void 0 : ctx.request) === null || _d === void 0 ? void 0 : _d.headers) === null || _e === void 0 ? void 0 : _e["user-agent"],
                };
            },
            dataSources: () => ({
                accountingDb: new accountingDb_1.AccountingDb({ client }),
            }),
            plugins: [(0, apollo_server_core_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
        });
        yield server.start();
        const app = new koa_1.default();
        app.use((0, graphql_upload_1.graphqlUploadKoa)({ maxFileSize: 10000000, maxFiles: 10 }));
        server.applyMiddleware({ app });
        httpServer.on("request", app.callback());
        yield new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
        console.log(`Graphql server ready at http://localhost:${PORT}${server.graphqlPath}`);
    }
    catch (e) {
        console.error(e);
    }
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxhQUFhLEVBQUU7SUFDMUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0NBQzVCO0FBRUQseURBQWlEO0FBQ2pELDJEQUF1RTtBQUN2RSw4Q0FBc0I7QUFDdEIsMkNBQTZCO0FBQzdCLG1EQUFrRDtBQUVsRCw0REFBb0M7QUFFcEMsd0RBQWdDO0FBQ2hDLHdEQUFnQztBQUNoQyxzREFBZ0M7QUFDaEMscUNBQW1DO0FBQ25DLDBFQUF1RTtBQUN2RSxrREFBNkQ7QUFDN0QsdUNBQTBDO0FBQzFDLHdEQUFxRDtBQUVyRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7QUFFdEMsQ0FBQyxHQUFTLEVBQUU7SUFDVixJQUFJO1FBQ0YsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUUsR0FBRyxNQUFNLElBQUEsaUJBQU8sR0FBRSxDQUFDO1FBQ3JGLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLFdBQVcsQ0FBQztRQUNuRCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUM7UUFFL0MsTUFBTSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLElBQUEsaUJBQU8sRUFBQztZQUNuQyxNQUFNLEVBQUUsT0FBTztZQUNmLE1BQU0sRUFBRSxPQUFPO1lBQ2YsTUFBTSxFQUFFLE9BQU87WUFDZixNQUFNLEVBQUUsT0FBTztZQUNmLEVBQUUsRUFBRSxZQUFZO1NBQ2pCLENBQUMsQ0FBQztR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