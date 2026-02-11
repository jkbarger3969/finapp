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
const graphql_upload_minimal_1 = require("graphql-upload-minimal");
const koa_static_1 = __importDefault(require("koa-static"));
const koa_mount_1 = __importDefault(require("koa-mount"));
const resolvers_1 = __importDefault(require("./resolvers"));
const secrets_1 = __importDefault(require("./secrets"));
const mongoDb_1 = __importDefault(require("./mongoDb"));
const schema_1 = __importDefault(require("./schema"));
const mongodb_1 = require("mongodb");
const accountingDb_1 = require("./dataSources/accountingDb/accountingDb");
const schema_2 = require("@graphql-tools/schema");
const loaders_1 = require("./loaders");
const authService_1 = require("./services/authService");
const emailService_1 = require("./services/emailService");
const PORT = process.env.PORT || 4000;
const RECEIPT_STORAGE_PATH = process.env.RECEIPT_STORAGE_PATH || "/tmp/receipts";
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
        // Use localhost for development, env variable for production
        const redirectUri = process.env.NODE_ENV === "development"
            ? "http://localhost:5173/login"
            : (process.env.GOOGLE_REDIRECT_URI || "http://localhost:5173/login");
        console.log(`Environment: ${process.env.NODE_ENV}, Redirect URI: ${redirectUri}`);
        let authService;
        if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
            authService = new authService_1.AuthService(db, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);
            console.log("Auth service initialized");
        }
        else {
            console.warn("Warning: Google OAuth credentials not configured. Auth disabled.");
        }
        // Verify email service connection
        const emailConnected = yield (0, emailService_1.verifyEmailConnection)();
        if (!emailConnected) {
            console.warn("Warning: Email service not connected. Check SMTP settings (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM)");
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
        app.use((0, graphql_upload_minimal_1.graphqlUploadKoa)({ maxFileSize: 10000000, maxFiles: 10 }));
        // Serve receipt files from storage directory
        if (RECEIPT_STORAGE_PATH) {
            app.use((0, koa_mount_1.default)("/receipts", (0, koa_static_1.default)(RECEIPT_STORAGE_PATH)));
            console.log(`📁 Serving receipts from: ${RECEIPT_STORAGE_PATH}`);
        }
        else {
            console.warn("Warning: RECEIPT_STORAGE_PATH not configured. Receipt serving disabled.");
        }
        server.applyMiddleware({ app });
        httpServer.on("request", app.callback());
        yield new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
        console.log(`Graphql server ready at http://localhost:${PORT}${server.graphqlPath}`);
        // Handle uncaught errors to prevent crashes
        process.on('uncaughtException', (err) => {
            console.error('Uncaught Exception:', err);
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });
    }
    catch (e) {
        console.error(e);
    }
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxhQUFhLEVBQUU7SUFDMUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0NBQzVCO0FBRUQseURBQWlEO0FBQ2pELDJEQUF1RTtBQUN2RSw4Q0FBc0I7QUFDdEIsMkNBQTZCO0FBQzdCLG1FQUEwRDtBQUMxRCw0REFBK0I7QUFDL0IsMERBQThCO0FBRTlCLDREQUFvQztBQUVwQyx3REFBZ0M7QUFDaEMsd0RBQWdDO0FBQ2hDLHNEQUFnQztBQUNoQyxxQ0FBbUM7QUFDbkMsMEVBQXVFO0FBQ3ZFLGtEQUE2RDtBQUM3RCx1Q0FBMEM7QUFDMUMsd0RBQXFEO0FBQ3JELDBEQUFnRTtBQUVoRSxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7QUFDdEMsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixJQUFJLGVBQWUsQ0FBQztBQUVqRixDQUFDLEdBQVMsRUFBRTtJQUNWLElBQUk7UUFDRixNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxvQkFBb0IsRUFBRSxHQUFHLE1BQU0sSUFBQSxpQkFBTyxHQUFFLENBQUM7UUFDckYsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksV0FBVyxDQUFDO1FBQ25ELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQztRQUUvQyxNQUFNLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sSUFBQSxpQkFBTyxFQUFDO1lBQ25DLE1BQU0sRUFB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