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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudGluZ0RiLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RhdGFTb3VyY2VzL2FjY291bnRpbmdEYi9hY2NvdW50aW5nRGIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEseURBQWlFO0FBZ0JqRSxNQUFhLFlBQWEsU0FBUSw4QkFBbUI7SUFLbkQsWUFBWSxFQUFFLE1BQU0sRUFBMkI7UUFDN0MsS0FBSyxFQUFFLENBQUM7UUFMVix1Q0FBOEI7UUFDOUIsbUNBQWlCO1FBQ2pCLGdDQUFpQyxJQUFJLEVBQUM7UUFDdEMsd0NBQTJCLENBQUMsRUFBQztRQUczQix1QkFBQSxJQUFJLHdCQUFXLE1BQU0sTUFBQSxDQUFDO1FBQ3RCLHVCQUFBLElBQUksb0JBQU8sTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBQSxDQUFDO0lBQ3JDLENBQUM7SUFDRCxJQUFJLE1BQU07UUFDUixPQUFPLHVCQUFBLElBQUksNEJBQVEsQ0FBQztJQUN0QixDQUFDO0lBRUQsSUFBSSxFQUFFO1FBQ0osT0FBTyx1QkFBQSxJQUFJLHdCQUFJLENBQUM7SUFDbEIsQ0FBQztJQUVELGFBQWEsQ0FDWCxVQUF1QjtRQUV2QixPQUFPLHVCQUFBLElBQUksd0JBQUksQ0FBQyxVQUFVLENBQW1DLFVBQVUsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFRDs7T0FFRztJQUNHLGVBQWUsQ0FDbkIsRUFBeUQ7OztZQUV6RCxNQUFNLE9BQU8sR0FBRyxHQUFHLEVBQUU7O2dCQUNuQixJQUFJLDREQUFBLENBQUUscUVBQXFCLEVBQXZCLElBQXVCLENBQUEsTUFBQSxLQUFLLENBQUMsRUFBRTtvQkFDakMsdUJBQUEsSUFBSSw2QkFBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUMzQix1QkFBQSxJQUFJLHlCQUFZLElBQUksTUFBQSxDQUFDO2lCQUN0QjtZQUNILENBQUMsQ0FBQztZQUVGLElBQUksTUFB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