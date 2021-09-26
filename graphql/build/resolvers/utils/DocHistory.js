"use strict";
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
var _NewHistoricalDoc_historicalFields, _NewHistoricalDoc_fields, _NewHistoricalDoc_docHistory, _NewHistoricalDoc_isRootDoc, _UpdateHistoricalDoc_historicalFields, _UpdateHistoricalDoc_fields, _UpdateHistoricalDoc_docHistory, _UpdateHistoricalDoc_isRootDoc, _UpdateHistoricalDoc_fieldPrefix, _DocHistory_by, _DocHistory_date;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocHistory = exports.UpdateHistoricalDoc = exports.NewHistoricalDoc = void 0;
class NewHistoricalDoc {
    constructor({ docHistory, isRootDoc, }) {
        _NewHistoricalDoc_historicalFields.set(this, new Map());
        _NewHistoricalDoc_fields.set(this, new Map());
        _NewHistoricalDoc_docHistory.set(this, void 0);
        _NewHistoricalDoc_isRootDoc.set(this, void 0);
        __classPrivateFieldSet(this, _NewHistoricalDoc_docHistory, docHistory, "f");
        __classPrivateFieldSet(this, _NewHistoricalDoc_isRootDoc, isRootDoc, "f");
    }
    addHistoricalField(field, value) {
        __classPrivateFieldGet(this, _NewHistoricalDoc_historicalFields, "f").set(field, value);
        return this;
    }
    /**
     * Utility method to set a straight key/value to the historical doc.
     */
    addFieldValued(field, value) {
        __classPrivateFieldGet(this, _NewHistoricalDoc_fields, "f").set(field, value);
        return this;
    }
    get doc() {
        return this.valueOf();
    }
    valueOf() {
        const docHistory = __classPrivateFieldGet(this, _NewHistoricalDoc_docHistory, "f");
        const doc = Object.assign({}, (__classPrivateFieldGet(this, _NewHistoricalDoc_isRootDoc, "f") ? docHistory.rootHistory : undefined));
        __classPrivateFieldGet(this, _NewHistoricalDoc_historicalFields, "f").forEach((value, key) => {
            doc[key] = [docHistory.historyObject(value)];
        });
        __classPrivateFieldGet(this, _NewHistoricalDoc_fields, "f").forEach((value, key) => {
            doc[key] = value;
        });
        return doc;
    }
    toString() {
        return JSON.stringify(this.valueOf());
    }
}
exports.NewHistoricalDoc = NewHistoricalDoc;
_NewHistoricalDoc_historicalFields = new WeakMap(), _NewHistoricalDoc_fields = new WeakMap(), _NewHistoricalDoc_docHistory = new WeakMap(), _NewHistoricalDoc_isRootDoc = new WeakMap();
class UpdateHistoricalDoc {
    constructor({ docHistory, isRootDoc, fieldPrefix, }) {
        _UpdateHistoricalDoc_historicalFields.set(this, new Map());
        _UpdateHistoricalDoc_fields.set(this, new Map());
        _UpdateHistoricalDoc_docHistory.set(this, void 0);
        _UpdateHistoricalDoc_isRootDoc.set(this, void 0);
        _UpdateHistoricalDoc_fieldPrefix.set(this, void 0);
        __classPrivateFieldSet(this, _UpdateHistoricalDoc_docHistory, docHistory, "f");
        __classPrivateFieldSet(this, _UpdateHistoricalDoc_isRootDoc, isRootDoc, "f");
        __classPrivateFieldSet(this, _UpdateHistoricalDoc_fieldPrefix, fieldPrefix, "f");
    }
    get hasUpdate() {
        return __classPrivateFieldGet(this, _UpdateHistoricalDoc_historicalFields, "f").size > 0 || __classPrivateFieldGet(this, _UpdateHistoricalDoc_fields, "f").size > 0;
    }
    updateHistoricalField(field, value) {
        __classPrivateFieldGet(this, _UpdateHistoricalDoc_historicalFields, "f").set(field, value);
        return this;
    }
    /**
     * Utility method to set a straight key/value on the update.
     */
    updateFieldValue(field, value) {
        __classPrivateFieldGet(this, _UpdateHistoricalDoc_fields, "f").set(field, value);
        return this;
    }
    get update() {
        return this.valueOf();
    }
    valueOf() {
        if (!this.hasUpdate) {
            return null;
        }
        const docHistory = __classPrivateFieldGet(this, _UpdateHistoricalDoc_docHistory, "f");
        const fieldPrefix = __classPrivateFieldGet(this, _UpdateHistoricalDoc_fieldPrefix, "f");
        const update = {};
        const $set = {};
        const $push = {};
        if (__classPrivateFieldGet(this, _UpdateHistoricalDoc_isRootDoc, "f")) {
            $set[UpdateHistoricalDoc.getFieldName("lastUpdate", fieldPrefix)] = docHistory.date;
            update.$set = $set;
        }
        if (__classPrivateFieldGet(this, _UpdateHistoricalDoc_fields, "f").size) {
            __classPrivateFieldGet(this, _UpdateHistoricalDoc_fields, "f").forEach((value, key) => {
                $set[UpdateHistoricalDoc.getFieldName(key, fieldPrefix)] =
                    value;
            });
            update.$set = $set;
        }
        if (__classPrivateFieldGet(this, _UpdateHistoricalDoc_historicalFields, "f").size) {
            __classPrivateFieldGet(this, _UpdateHistoricalDoc_historicalFields, "f").forEach((value, key) => {
                const updateValue = {
                    $each: [docHistory.historyObject(value)],
                    $position: 0,
                };
                $push[UpdateHistoricalDoc.getFieldName(key, fieldPrefix)] =
                    updateValue;
            });
            update.$push = $push;
        }
        return update;
    }
    toString() {
        return JSON.stringify(this.valueOf());
    }
    static getFieldName(field, fieldPrefix) {
        return (fieldPrefix ? `${fieldPrefix}.${field}` : field);
    }
}
exports.UpdateHistoricalDoc = UpdateHistoricalDoc;
_UpdateHistoricalDoc_historicalFields = new WeakMap(), _UpdateHistoricalDoc_fields = new WeakMap(), _UpdateHistoricalDoc_docHistory = new WeakMap(), _UpdateHistoricalDoc_isRootDoc = new WeakMap(), _UpdateHistoricalDoc_fieldPrefix = new WeakMap();
class DocHistory {
    constructor({ by, date = new Date() }) {
        _DocHistory_by.set(this, void 0);
        _DocHistory_date.set(this, void 0);
        __classPrivateFieldSet(this, _DocHistory_by, by, "f");
        __classPrivateFieldSet(this, _DocHistory_date, date, "f");
    }
    get date() {
        return __classPrivateFieldGet(this, _DocHistory_date, "f");
    }
    get by() {
        return __classPrivateFieldGet(this, _DocHistory_by, "f");
    }
    get rootHistory() {
        return {
            lastUpdate: __classPrivateFieldGet(this, _DocHistory_date, "f"),
            createdOn: __classPrivateFieldGet(this, _DocHistory_date, "f"),
            createdBy: __classPrivateFieldGet(this, _DocHistory_by, "f"),
        };
    }
    historyObject(value) {
        return {
            value,
            createdBy: __classPrivateFieldGet(this, _DocHistory_by, "f"),
            createdOn: __classPrivateFieldGet(this, _DocHistory_date, "f"),
        };
    }
}
exports.DocHistory = DocHistory;
_DocHistory_by = new WeakMap(), _DocHistory_date = new WeakMap();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG9jSGlzdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvRG9jSGlzdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFxRUEsTUFBYSxnQkFBZ0I7SUFjM0IsWUFBWSxFQUNWLFVBQVUsRUFDVixTQUFTLEdBSVY7UUFkRCw2Q0FBNkIsSUFBSSxHQUFHLEVBR2pDLEVBQUM7UUFDSixtQ0FBbUIsSUFBSSxHQUFHLEVBQXNDLEVBQUM7UUFDakUsK0NBQWlDO1FBQ2pDLDhDQUErQjtRQVM3Qix1QkFBQSxJQUFJLGdDQUFlLFVBQVUsTUFBQSxDQUFDO1FBQzlCLHVCQUFBLElBQUksK0JBQWMsU0FBUyxNQUFBLENBQUM7SUFDOUIsQ0FBQztJQUVELGtCQUFrQixDQUtoQixLQUFRLEVBQUUsS0FBMEI7UUFDcEMsdUJBQUEsSUFBSSwwQ0FBa0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOztPQUVHO0lBQ0gsY0FBYyxDQUtaLEtBQVEsRUFBRSxLQUFnQjtRQUMxQix1QkFBQSxJQUFJLGdDQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxJQUFJLEdBQUc7UUFDTCxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQsT0FBTztRQUNMLE1BQU0sVUFBVSxHQUFHLHVCQUFBLElBQUksb0NBQVksQ0FBQztRQUNwQyxNQUFNLEdBQUcsR0FBRyxrQkFDUCxDQUFDLHVCQUFBLElBQUksbUNBQVcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQ08sQ0FBQztRQUVuRSx1QkFBQSxJQUFJLDBDQUFrQixDQUFD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