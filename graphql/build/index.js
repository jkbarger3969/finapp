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
// Load .env file in all environments (production uses .env on server)
require("dotenv").config();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0VBQXNFO0FBQ3RFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUUzQix5REFBaUQ7QUFDakQsMkRBQXVFO0FBQ3ZFLDhDQUFzQjtBQUN0QiwyQ0FBNkI7QUFDN0IsbUVBQTBEO0FBQzFELDREQUErQjtBQUMvQiwwREFBOEI7QUFFOUIsNERBQW9DO0FBRXBDLHdEQUFnQztBQUNoQyx3REFBZ0M7QUFDaEMsc0RBQWdDO0FBQ2hDLHFDQUFtQztBQUNuQywwRUFBdUU7QUFDdkUsa0RBQTZEO0FBQzdELHVDQUEwQztBQUMxQyx3REFBcUQ7QUFDckQsMERBQWdFO0FBRWhFLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztBQUN0QyxNQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLElBQUksZUFBZSxDQUFDO0FBRWpGLENBQUMsR0FBUyxFQUFFO0lBQ1YsSUFBSTtRQUNGLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLEdBQUcsTUFBTSxJQUFBLGlCQUFPLEdBQUUsQ0FBQztRQUNyRixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxXQUFXLENBQUM7UUFDbkQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDO1FBRS9DLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFBLGlCQUFPLEVBQUM7WUFDbkMsTUFBTSxFQUFFLE9BQU87WUFDZixNQUFNLEVBQUUsT0FBTztZQUNmLE1BQU0sRUFBRSxP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