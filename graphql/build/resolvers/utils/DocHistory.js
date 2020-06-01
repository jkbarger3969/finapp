"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NewHistoricalDoc {
    constructor(_docHistory_, withRootHistory) {
        this._docHistory_ = _docHistory_;
        this._doc_ = (withRootHistory
            ? Object.assign({}, _docHistory_.rootHistory()) : {});
    }
    addField(field, value) {
        this._doc_[field] = this._docHistory_.newValue(value);
        return this;
    }
    addFields(fieldValuesMap) {
        for (const [field, value] of fieldValuesMap) {
            this.addField(field, value);
        }
        return this;
    }
    doc() {
        return this._doc_;
    }
}
class UpdateHistoricalDoc {
    constructor(_docHistory_, args) {
        this._docHistory_ = _docHistory_;
        this._prependUpdateFields_ = "";
        this._hasUpdate_ = false;
        if (args) {
            if (typeof args === "string") {
                this._prependUpdateFields_ = `${args}.`;
                this._update_ = {
                    $push: {},
                    $set: {
                        [`${this._prependUpdateFields_}lastUpdate`]: _docHistory_.date,
                    },
                };
            }
            else {
                if (args.prependUpdateFields) {
                    this._prependUpdateFields_ = `${args.prependUpdateFields}.`;
                }
                if (args.prependLastUpdate) {
                    this._update_ = {
                        $push: {},
                        $set: {
                            [`${args.prependLastUpdate}.lastUpdate`]: _docHistory_.date,
                        },
                    };
                }
            }
        }
        else {
            this._update_ = {
                $push: {},
                $set: { lastUpdate: _docHistory_.date },
            };
        }
    }
    get hasUpdate() {
        return this._hasUpdate_;
    }
    updateField(field, value) {
        this._update_.$push[`${this._prependUpdateFields_}${field}`] = {
            $each: [this._docHistory_.historyObject(value)],
            $position: 0,
        };
        this._hasUpdate_ = true;
        return this;
    }
    updateFields(fieldValuesMap) {
        for (const [field, value] of fieldValuesMap) {
            this.updateField(field, value);
        }
        return this;
    }
    update() {
        return this._update_;
    }
}
class DocHistory {
    constructor(_by_, _date_ = new Date()) {
        this._by_ = _by_;
        this._date_ = _date_;
    }
    get date() {
        return this._date_;
    }
    get by() {
        return this._by_;
    }
    rootHistory() {
        return {
            lastUpdate: this._date_,
            createdOn: this._date_,
            createdBy: this._by_,
        };
    }
    // newHistoricalDoc(withRootHistory: true): NewHistoricalDoc<true>;
    // newHistoricalDoc(withRootHistory: false): NewHistoricalDoc<false>;
    newHistoricalDoc(withRootHistory) {
        return new NewHistoricalDoc(this, withRootHistory);
    }
    updateHistoricalDoc(prependFields) {
        return new UpdateHistoricalDoc(this, prependFields);
    }
    historyObject(value) {
        return {
            value,
            createdBy: this._by_,
            createdOn: this._date_,
        };
    }
    newValue(value) {
        return [this.historyObject(value)];
    }
    getPresentValues(presentValueMap) {
        return DocHistory.getPresentValues(presentValueMap);
    }
    static getPresentValuesAllFields(args = {
        path: "$$ROOT",
    }) {
        const { path = "$$ROOT", exclude } = args;
        const isRoot = path === "$$ROOT";
        const docLocation = isRoot ? "__doc" : `${path}.__doc`;
        return [
            {
                $addFields: {
                    [docLocation]: {
                        $arrayToObject: {
                            $map: {
                                input: { $objectToArray: isRoot ? path : `$${path}` },
                                as: "kv",
                                in: {
                                    $cond: {
                                        if: Object.assign({ $eq: [{ $type: "$$kv.v" }, "array"] }, (exclude ? { $nin: ["$$kv.k", [...exclude]] } : {})),
                                        then: {
                                            k: "$$kv.k",
                                            v: {
                                                $ifNull: [{ $arrayElemAt: ["$$kv.v.value", 0] }, null],
                                            },
                                        },
                                        else: "$$kv",
                                    },
                                },
                            },
                        },
                    },
                },
            },
            isRoot
                ? { $replaceRoot: { newRoot: `$${docLocation}` } }
                : {
                    $addFields: {
                        [docLocation]: `$${docLocation}.__doc`,
                    },
                },
        ];
    }
    static getPresentValueExpression(key, opts = {}) {
        const asVar = opts.asVar ? `$${opts.asVar}.` : "";
        const defaultValue = "defaultValue" in opts ? opts.defaultValue : null;
        return {
            $ifNull: [
                { $arrayElemAt: [`$${asVar}${key}.value`, 0] },
                defaultValue,
            ],
        };
    }
    static getPresentValues(presentValueMap, opts = {}) {
        const presentValueProjection = {};
        for (const val of presentValueMap) {
            if (typeof val === "string") {
                presentValueProjection[val] = this.getPresentValueExpression(val, opts);
            }
            else {
                const [key, keyOpts] = val;
                presentValueProjection[key] = this.getPresentValueExpression(key, Object.assign(Object.assign({}, opts), keyOpts));
            }
        }
        return presentValueProjection;
    }
}
exports.default = DocHistory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG9jSGlzdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvRG9jSGlzdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQStDQSxNQUFNLGdCQUFnQjtJQUVwQixZQUE2QixZQUF3QixFQUFFLGVBQWtCO1FBQTVDLGlCQUFZLEdBQVosWUFBWSxDQUFZO1FBQ25ELElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxlQUFlO1lBQzNCLENBQUMsbUJBQU0sWUFBWSxDQUFDLFdBQVcsRUFBRSxFQUNqQyxDQUFDLENBQUMsRUFBRSxDQUFRLENBQUM7SUFDakIsQ0FBQztJQUNELFFBQVEsQ0FBSSxLQUFhLEVBQUUsS0FBUTtRQUNoQyxJQUFJLENBQUMsS0FBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9ELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELFNBQVMsQ0FBQyxjQUF1QztRQUMvQyxLQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksY0FBYyxFQUFFO1lBQzNDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzdCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsR0FBRztRQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0NBQ0Y7QUFFRCxNQUFNLG1CQUFtQjtJQUl2QixZQUNtQixZQUF3QixFQUN6QyxJQUtVO1FBTk8saUJBQVksR0FBWixZQUFZLENBQVk7UUFIMUIsMEJBQXFCLEdBQVcsRUFBRSxDQUFDO1FBQzVDLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBVTFCLElBQUksSUFBSSxFQUFFO1lBQ1IsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxxQkFBcUIsR0FB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