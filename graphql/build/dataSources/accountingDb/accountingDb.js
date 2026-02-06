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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AccountingDb_client, _AccountingDb_db, _AccountingDb_session, _AccountingDb_sessionRefCount;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingDb = void 0;
const apollo_datasource_1 = require("apollo-datasource");
class AccountingDb extends apollo_datasource_1.DataSource {
    constructor({ client }) {
        super();
        _AccountingDb_client.set(this, void 0);
        _AccountingDb_db.set(this, void 0);
        _AccountingDb_session.set(this, null);
        _AccountingDb_sessionRefCount.set(this, 0);
        __classPrivateFieldSet(this, _AccountingDb_client, client, "f");
        __classPrivateFieldSet(this, _AccountingDb_db, client.db("accounting"), "f");
    }
    get client() {
        return __classPrivateFieldGet(this, _AccountingDb_client, "f");
    }
    get db() {
        return __classPrivateFieldGet(this, _AccountingDb_db, "f");
    }
    getCollection(collection) {
        return __classPrivateFieldGet(this, _AccountingDb_db, "f").collection(collection);
    }
    /**
     * Handles the session, and nested calls to withTransaction.
     *
     * NOTE: Transactions are disabled for local development.
     * MongoDB transactions require a replica set, which is complex to set up locally.
     * For production, configure MongoDB as a replica set and remove this bypass.
     */
    withTransaction(cb) {
        return __awaiter(this, void 0, void 0, function* () {
            // Bypass transactions for development - just execute the callback
            // Pass null session (most MongoDB operations work without sessions)
            return yield cb({ session: null });
        });
    }
    insertOne({ collection, doc, }) {
        return __classPrivateFieldGet(this, _AccountingDb_db, "f")
            .collection(collection)
            .insertOne(doc, __classPrivateFieldGet(this, _AccountingDb_session, "f") && __classPrivateFieldGet(this, _AccountingDb_session, "f").inTransaction()
            ? {
                session: __classPrivateFieldGet(this, _AccountingDb_session, "f"),
            }
            : undefined);
    }
    updateOne({ collection, filter, update, }) {
        return __classPrivateFieldGet(this, _AccountingDb_db, "f")
            .collection(collection)
            .updateOne(filter, update, __classPrivateFieldGet(this, _AccountingDb_session, "f") && __classPrivateFieldGet(this, _AccountingDb_session, "f").inTransaction()
            ? {
                session: __classPrivateFieldGet(this, _AccountingDb_session, "f"),
            }
            : undefined);
    }
    find({ collection, filter, options, }) {
        return __classPrivateFieldGet(this, _AccountingDb_db, "f")
            .collection(collection)
            .find(filter, __classPrivateFieldGet(this, _AccountingDb_session, "f") && __classPrivateFieldGet(this, _AccountingDb_session, "f").inTransaction()
            ? Object.assign({ session: __classPrivateFieldGet(this, _AccountingDb_session, "f") }, options) : options)
            .toArray();
    }
    findOne({ collection, filter, options, }) {
        return __classPrivateFieldGet(this, _AccountingDb_db, "f")
            .collection(collection)
            .findOne(filter, __classPrivateFieldGet(this, _AccountingDb_session, "f") && __classPrivateFieldGet(this, _AccountingDb_session, "f").inTransaction()
            ? Object.assign({ session: __classPrivateFieldGet(this, _AccountingDb_session, "f") }, options) : options);
    }
}
exports.AccountingDb = AccountingDb;
_AccountingDb_client = new WeakMap(), _AccountingDb_db = new WeakMap(), _AccountingDb_session = new WeakMap(), _AccountingDb_sessionRefCount = new WeakMap();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudGluZ0RiLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RhdGFTb3VyY2VzL2FjY291bnRpbmdEYi9hY2NvdW50aW5nRGIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEseURBQWlFO0FBZ0JqRSxNQUFhLFlBQWEsU0FBUSw4QkFBbUI7SUFLbkQsWUFBWSxFQUFFLE1BQU0sRUFBMkI7UUFDN0MsS0FBSyxFQUFFLENBQUM7UUFMVix1Q0FBOEI7UUFDOUIsbUNBQWlCO1FBQ2pCLGdDQUFpQyxJQUFJLEVBQUM7UUFDdEMsd0NBQTJCLENBQUMsRUFBQztRQUczQix1QkFBQSxJQUFJLHdCQUFXLE1BQU0sTUFBQSxDQUFDO1FBQ3RCLHVCQUFBLElBQUksb0JBQU8sTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBQSxDQUFDO0lBQ3JDLENBQUM7SUFDRCxJQUFJLE1BQU07UUFDUixPQUFPLHVCQUFBLElBQUksNEJBQVEsQ0FBQztJQUN0QixDQUFDO0lBRUQsSUFBSSxFQUFFO1FBQ0osT0FBTyx1QkFBQSxJQUFJLHdCQUFJLENBQUM7SUFDbEIsQ0FBQztJQUVELGFBQWEsQ0FDWCxVQUF1QjtRQUV2QixPQUFPLHVCQUFBLElBQUksd0JBQUksQ0FBQyxVQUFVLENBQW1DLFVBQVUsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDRyxlQUFlLENBQ25CLEVBQXlEOztZQUV6RCxrRUFBa0U7WUFDbEUsb0VBQW9FO1lBQ3BFLE9BQU8sTUFBTSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBVyxFQUFFLENBQUMsQ0FBQztRQUM1QyxDQUFDO0tBQUE7SUFFRCxTQUFTLENBQWdELEVBQ3ZELFVBQVUsRUFDVixHQUFHLEdBSUo7UUFDQyxPQUFPLHVCQUFBLElBQUksd0JBQUk7YUFDWixVQUFVLENBQW1DLFVBQVUsQ0FBQzthQUN4RCxTQUFTLENBQ1IsR0FBRyxFQUNILHVCQUFBLElBQUksNkJBQVMsSUFBSSx1QkFBQSxJQUFJLDZCQUFTLENBQUMsYUFBYSxFQUFFO1lBQzVDLENBQUMsQ0FBQztnQkFDQSxPQUFPLEVBQUUsdUJBQUEsSUFBSSw2QkFBUzthQUN2QjtZQUNELENBQUMsQ0FBQyxTQUFTLENBQ2QsQ0FBQztJQUNOLENBQUM7SUFFRCxTQUFTLENBQWdELEVBQ3ZELFVBQVUsRUFDVixNQUFNLEVBQ04sTUFBTSxHQUtQO1FBQ0MsT0FBTyx1QkFBQSxJQUFJLHdCQUFJO2FBQ1osVUFBVSxDQUFtQyxVQUFVLENBQUM7YUFDeEQsU0FBUyxDQUNSLE1BQU0sRUFDTixNQUFNLEVBQ04sdUJBQUEsSUFBSSw2QkFBUyxJQUFJLHVCQUFBLElBQUksNkJBQVMsQ0FBQyxhQUFhLEVBQUU7WUFDNUMsQ0FBQyxDQUFDO2dCQUNBLE9BQU8sRUFBRSx1QkFBQSxJQUFJLDZCQUFTO2FBQ3ZCO1lBQ0QsQ0FBQyxDQUFDLFNBQVMsQ0FDZCxDQUFDO0lBQ04sQ0FBQztJQUVELElBQUksQ0FBZ0QsRUFDbEQsVUFBVSxFQUNWLE1BQU0sRUFDTixPQUFPLEdBTVI7UUFDQyxPQUFPLHVCQUFBLElBQUksd0JBQUk7YUFDWixVQUFVLENBQW1DLFVBQVUsQ0FBQzthQUN4RCxJQUFJLENBQ0gsTUFBTSxFQUNOLHVCQUFBLElBQUksNkJBQVMsSUFBSSx1QkFBQSxJQUFJLDZCQUFTLENBQUMsYUFBYSxFQUFFO1lBQzVDLENBQUMsaUJBQ0MsT0FBTyxFQUFFLHVCQUFBLElBQUksNkJBQVMsSUFDbkIsT0FBTyxFQUVaLENBQUMsQ0FBQyxPQUFPLENBQ1o7YUFDQSxPQUFPLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFFRCxPQUFPLENBQWdELEVBQ3JELFVBQVUsRUFDVixNQUFNLEVBQ04sT0FBTyxHQU1SO1FBQ0MsT0FBTyx1QkFBQSxJQUFJLHdCQUFJO2FBQ1osVUFBVSxDQUFtQyxVQUFVLENBQUM7YUFDeEQsT0FBTyxDQUNOLE1BQU0sRUFDTix1QkFBQSxJQUFJLDZCQUFTLElBQUksdUJBQUEsSUFBSSw2QkFBUyxDQUFDLGFBQWEsRUFBRTtZQUM1QyxDQUFDLGlCQUNDLE9BQU8sRUFBRSx1QkFBQSxJQUFJLDZCQUFTLElBQ25CLE9BQU8sRUFFWixDQUFDLENBQUMsT0FBTyxDQUNaLENBQUM7SUFDTixDQUFDO0NBQ0Y7QUE5SEQsb0NBOEhDIn0=