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
    /**
     * Handles the session, and nested calls to withTransaction,
     */
    withTransaction(cb) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const cleanUp = () => {
                var _a;
                if (__classPrivateFieldSet(this, _AccountingDb_sessionRefCount, (_a = __classPrivateFieldGet(this, _AccountingDb_sessionRefCount, "f"), --_a), "f") === 0) {
                    __classPrivateFieldGet(this, _AccountingDb_session, "f").endSession();
                    __classPrivateFieldSet(this, _AccountingDb_session, null, "f");
                }
            };
            let result;
            try {
                if ((__classPrivateFieldSet(this, _AccountingDb_sessionRefCount, (_b = __classPrivateFieldGet(this, _AccountingDb_sessionRefCount, "f"), _a = _b++, _b), "f"), _a) === 0) {
                    __classPrivateFieldSet(this, _AccountingDb_session, __classPrivateFieldGet(this, _AccountingDb_client, "f").startSession(), "f");
                    yield __classPrivateFieldGet(this, _AccountingDb_session, "f").withTransaction(() => this.withTransaction(cb).then((value) => {
                        result = value;
                    }));
                }
                else {
                    result = yield cb({ session: __classPrivateFieldGet(this, _AccountingDb_session, "f") });
                }
                cleanUp();
                return result;
            }
            catch (e) {
                cleanUp();
                throw e;
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudGluZ0RiLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RhdGFTb3VyY2VzL2FjY291bnRpbmdEYi9hY2NvdW50aW5nRGIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEseURBQWlFO0FBZ0JqRSxNQUFhLFlBQWEsU0FBUSw4QkFBbUI7SUFLbkQsWUFBWSxFQUFFLE1BQU0sRUFBMkI7UUFDN0MsS0FBSyxFQUFFLENBQUM7UUFMVix1Q0FBOEI7UUFDOUIsbUNBQWlCO1FBQ2pCLGdDQUFpQyxJQUFJLEVBQUM7UUFDdEMsd0NBQTJCLENBQUMsRUFBQztRQUczQix1QkFBQSxJQUFJLHdCQUFXLE1BQU0sTUFBQSxDQUFDO1FBQ3RCLHVCQUFBLElBQUksb0JBQU8sTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBQSxDQUFDO0lBQ3JDLENBQUM7SUFDRCxJQUFJLE1BQU07UUFDUixPQUFPLHVCQUFBLElBQUksNEJBQVEsQ0FBQztJQUN0QixDQUFDO0lBRUQsSUFBSSxFQUFFO1FBQ0osT0FBTyx1QkFBQSxJQUFJLHdCQUFJLENBQUM7SUFDbEIsQ0FBQztJQUVEOztPQUVHO0lBQ0csZUFBZSxDQUNuQixFQUF5RDs7O1lBRXpELE1BQU0sT0FBTyxHQUFHLEdBQUcsRUFBRTs7Z0JBQ25CLElBQUksNERBQUEsQ0FBRSxxRUFBcUIsRUFBdkIsSUFBdUIsQ0FBQSxNQUFBLEtBQUssQ0FBQyxFQUFFO29CQUNqQyx1QkFBQSxJQUFJLDZCQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQzNCLHVCQUFBLElBQUkseUJBQVksSUFBSSxNQUFBLENBQUM7aUJBQ3RCO1lBQ0gsQ0FBQyxDQUFDO1lBRUYsSUFBSSxNQUFlLENBQUM7WUFFcEIsSUFBSTtnQkFDRixJQUFJLENBQUEsNERBQUEsQ0FBQSxxRUFBcUIsRUFBckIsS0FBQSxJQUF1QixJQUFBLENBQUEsTUFBQSxJQUFBLE1B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