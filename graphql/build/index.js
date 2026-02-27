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
function getClientIP(ctx) {
    var _a, _b, _c, _d, _e, _f, _g;
    return ((_b = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.request) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b['x-real-ip']) ||
        ((_f = (_e = (_d = (_c = ctx === null || ctx === void 0 ? void 0 : ctx.request) === null || _c === void 0 ? void 0 : _c.headers) === null || _d === void 0 ? void 0 : _d['x-forwarded-for']) === null || _e === void 0 ? void 0 : _e.split(',')[0]) === null || _f === void 0 ? void 0 : _f.trim()) ||
        ((_g = ctx === null || ctx === void 0 ? void 0 : ctx.request) === null || _g === void 0 ? void 0 : _g.ip) ||
        'unknown';
}
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
        yield db.collection("auditLog").createIndex({ action: 1 });
        // Entries Indexes for Performance - wrap in try/catch since compound indexes may fail on parallel arrays
        try {
            yield db.collection("entries").createIndex({ "date.0.value": -1 });
            yield db.collection("entries").createIndex({ "category.0.value": 1 });
            yield db.collection("entries").createIndex({ "paymentMethod.type": 1 });
            yield db.collection("entries").createIndex({ "reconciled.0.value": 1 });
            yield db.collection("entries").createIndex({ "description.0.value": 1 });
        }
        catch (indexError) {
            console.warn("Some indexes could not be created:", indexError);
        }
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
                var _a, _b, _c, _d;
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
                    console.warn("⚠️  DEV MODE: Using fallback user ID (auth disabled). DO NOT use in production.");
                    user = { id: new mongodb_1.ObjectId("5de16db089c4360df927a3db") };
                }
                return {
                    client,
                    db,
                    user,
                    reqDateTime: new Date(),
                    loaders: (0, loaders_1.createLoaders)(db),
                    authService,
                    ipAddress: getClientIP(ctx),
                    userAgent: (_d = (_c = ctx === null || ctx === void 0 ? void 0 : ctx.request) === null || _c === void 0 ? void 0 : _c.headers) === null || _d === void 0 ? void 0 : _d["user-agent"],
                };
            },
            dataSources: () => ({
                accountingDb: new accountingDb_1.AccountingDb({ client }),
            }),
            plugins: [(0, apollo_server_core_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
        });
        yield server.start();
        const app = new koa_1.default();
        app.proxy = true;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0VBQXNFO0FBQ3RFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUUzQix5REFBaUQ7QUFDakQsMkRBQXVFO0FBQ3ZFLDhDQUFzQjtBQUN0QiwyQ0FBNkI7QUFDN0IsbUVBQTBEO0FBQzFELDREQUErQjtBQUMvQiwwREFBOEI7QUFFOUIsNERBQW9DO0FBRXBDLHdEQUFnQztBQUNoQyx3REFBZ0M7QUFDaEMsc0RBQWdDO0FBQ2hDLHFDQUFtQztBQUNuQywwRUFBdUU7QUFDdkUsa0RBQTZEO0FBQzdELHVDQUEwQztBQUMxQyx3REFBcUQ7QUFDckQsMERBQWdFO0FBRWhFLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztBQUN0QyxNQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLElBQUksZUFBZSxDQUFDO0FBRWpGLFNBQVMsV0FBVyxDQUFDLEdBQVE7O0lBQ3pCLE9BQU8sQ0FBQSxNQUFBLE1BQUEsR0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFFLE9BQU8sMENBQUUsT0FBTywwQ0FBRyxXQUFXLENBQUM7U0FDcEMsTUFBQSxNQUFBLE1BQUEsTUFBQSxHQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUUsT0FBTywwQ0FBRSxPQUFPLDBDQUFHLGlCQUFpQixDQUFDLDBDQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLDBDQUFFLElBQUksRUFBRSxDQUFBO1NBQ2pFLE1BQUEsR0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFFLE9BQU8sMENBQUUsRUFBRSxDQUFBO1FBQ2hCLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBRUQsQ0FB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