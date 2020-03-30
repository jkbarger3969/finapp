"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DocHistory {
    constructor(_by_, _date_ = new Date()) {
        this._by_ = _by_;
        this._date_ = _date_;
        this._push_ = {};
        this._hasUpdate_ = false;
    }
    get updatePushArg() {
        return this._push_;
    }
    get hasUpdate() {
        return this._hasUpdate_;
    }
    get lastUpdate() {
        return this._date_;
    }
    get createdBy() {
        return this._by_;
    }
    get rootHistoryObject() {
        return {
            lastUpdate: this._date_,
            createdOn: this._date_,
            createdBy: this._by_
        };
    }
    getPresentValues(presentValueMap) {
        return DocHistory.getPresentValues(presentValueMap);
    }
    static getPresentValues(presentValueMap) {
        const presentValueProjection = {};
        for (const key of presentValueMap) {
            presentValueProjection[key] = {
                $ifNull: [{ $arrayElemAt: [`$${key}.value`, 0] }, null]
            };
        }
        return presentValueProjection;
    }
    historyObject(value) {
        return {
            value,
            createdBy: this._by_,
            createdOn: this._date_
        };
    }
    updateValue(field, value) {
        this._push_[field] = {
            $each: [this.historyObject(value)],
            $position: 0
        };
        this._hasUpdate_ = true;
        return this;
    }
    updateValues(fieldValuesMap) {
        for (const [field, value] of fieldValuesMap) {
            this.updateValue(field, value);
        }
        return this;
    }
    addValue(value) {
        return [this.historyObject(value)];
    }
}
exports.default = DocHistory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG9jSGlzdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvRG9jSGlzdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQW9DQSxNQUFxQixVQUFVO0lBSTdCLFlBQ21CLElBQWUsRUFDZixTQUFTLElBQUksSUFBSSxFQUFFO1FBRG5CLFNBQUksR0FBSixJQUFJLENBQVc7UUFDZixXQUFNLEdBQU4sTUFBTSxDQUFhO1FBTHJCLFdBQU0sR0FBb0IsRUFBRSxDQUFDO1FBQ3RDLGdCQUFXLEdBQUcsS0FBSyxDQUFDO0lBS3pCLENBQUM7SUFFSixJQUFJLGFBQWE7UUFDZixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDckIsQ0FBQztJQUVELElBQUksU0FBUztRQUNYLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBSSxVQUFVO1FBQ1osT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDWCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDbkIsQ0FBQztJQUVELElBQUksaUJBQWlCO1FBQ25CLE9BQU87WUFDTCxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDdkIsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ3RCLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSTtTQUNaLENBQUM7SUFDYixDQUFDO0lBRUQsZ0JBQWdCLENBQUMsZUFBZ0M7UUFDL0MsT0FBTyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FDckIsZUFBZ0M7UUFFaEMsTUFBTSxzQkFBc0IsR0FBRyxFQUU5QixDQUFDO1FBRUYsS0FBSyxNQUFNLEdBQUcsSUFBSSxlQUFlLEVBQUU7WUFDakMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLEdBQUc7Z0JBQzVCLE9BQU8sRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLENBQUMsSUFBSSxHQUFHLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQzthQUN4RCxDQUFDO1NBQ0g7UUFFRCxPQUFPLHNCQUFzQixDQUFDO0lBQ2hDLENBQUM7SUFFRCxhQUFhLENBQUksS0FBUTtRQUN2QixPQUFPO1lBQ0wsS0FBSztZQUNMLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNwQixTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU07U0FDdkIsQ0FBQztJQUNKLENBQUM7SUFFRCxXQUFXLENBQUksS0FBYSxFQUFFLEtBQVE7UUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRztZQUNuQixLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xDLFNBQVMsRUFBRSxDQUFDO1NBQ2IsQ0FBQztRQUNGLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELFlBQVksQ0FBQyxjQUF1QztRQUNsRCxLQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksY0FBYyxFQUFFO1lBQzNDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ2hDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsUUFBUSxDQUFJLEtBQVE7UUFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNyQyxDQUFDO0NBQ0Y7QUEvRUQsNkJBK0VDIn0=