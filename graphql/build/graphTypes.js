"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegexOptions = exports.FilterType = exports.SortDirection = exports.RationalSign = exports.JournalEntrySourceType = exports.JournalEntryType = exports.DepartmentAncestorType = exports.BudgetOwnerType = void 0;
var BudgetOwnerType;
(function (BudgetOwnerType) {
    BudgetOwnerType["Business"] = "BUSINESS";
    BudgetOwnerType["Department"] = "DEPARTMENT";
})(BudgetOwnerType = exports.BudgetOwnerType || (exports.BudgetOwnerType = {}));
var DepartmentAncestorType;
(function (DepartmentAncestorType) {
    DepartmentAncestorType["Business"] = "BUSINESS";
    DepartmentAncestorType["Department"] = "DEPARTMENT";
})(DepartmentAncestorType = exports.DepartmentAncestorType || (exports.DepartmentAncestorType = {}));
var JournalEntryType;
(function (JournalEntryType) {
    JournalEntryType["Credit"] = "CREDIT";
    JournalEntryType["Debit"] = "DEBIT";
})(JournalEntryType = exports.JournalEntryType || (exports.JournalEntryType = {}));
var JournalEntrySourceType;
(function (JournalEntrySourceType) {
    JournalEntrySourceType["Business"] = "BUSINESS";
    JournalEntrySourceType["Department"] = "DEPARTMENT";
    JournalEntrySourceType["Person"] = "PERSON";
})(JournalEntrySourceType = exports.JournalEntrySourceType || (exports.JournalEntrySourceType = {}));
var RationalSign;
(function (RationalSign) {
    RationalSign["Pos"] = "POS";
    RationalSign["Neg"] = "NEG";
})(RationalSign = exports.RationalSign || (exports.RationalSign = {}));
var SortDirection;
(function (SortDirection) {
    SortDirection["Asc"] = "ASC";
    SortDirection["Desc"] = "DESC";
})(SortDirection = exports.SortDirection || (exports.SortDirection = {}));
var FilterType;
(function (FilterType) {
    FilterType["Include"] = "INCLUDE";
    FilterType["Exclude"] = "EXCLUDE";
})(FilterType = exports.FilterType || (exports.FilterType = {}));
var RegexOptions;
(function (RegexOptions) {
    RegexOptions["CaseInsensitive"] = "CaseInsensitive";
    RegexOptions["Multiline"] = "Multiline";
    RegexOptions["Extended"] = "Extended";
    RegexOptions["DotAll"] = "DotAll";
    RegexOptions["I"] = "I";
    RegexOptions["M"] = "M";
    RegexOptions["X"] = "X";
    RegexOptions["S"] = "S";
})(RegexOptions = exports.RegexOptions || (exports.RegexOptions = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JhcGhUeXBlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9ncmFwaFR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQXlCQSxJQUFZLGVBR1g7QUFIRCxXQUFZLGVBQWU7SUFDekIsd0NBQXFCLENBQUE7SUFDckIsNENBQXlCLENBQUE7QUFDM0IsQ0FBQyxFQUhXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBRzFCO0FBeVNELElBQVksc0JBR1g7QUFIRCxXQUFZLHNCQUFzQjtJQUNoQywrQ0FBcUIsQ0FBQTtJQUNyQixtREFBeUIsQ0FBQTtBQUMzQixDQUFDLEVBSFcsc0JBQXNCLEdBQXRCLDhCQUFzQixLQUF0Qiw4QkFBc0IsUUFHakM7QUEwREQsSUFBWSxnQkFHWDtBQUhELFdBQVksZ0JBQWdCO0lBQzFCLHFDQUFpQixDQUFBO0lBQ2pCLG1DQUFlLENBQUE7QUFDakIsQ0FBQyxFQUhXLGdCQUFnQixHQUFoQix3QkFBZ0IsS0FBaEIsd0JBQWdCLFFBRzNCO0FBZ0RELElBQVksc0JBSVg7QUFKRCxXQUFZLHNCQUFzQjtJQUNoQywrQ0FBcUIsQ0FBQTtJQUNyQixtREFBeUIsQ0FBQTtJQUN6QiwyQ0FBaUIsQ0FBQTtBQUNuQixDQUFDLEVBSlcsc0JBQXNCLEdBQXRCLDhCQUFzQixLQUF0Qiw4QkFBc0IsUUFJakM7QUF3VEQsSUFBWSxZQUdYO0FBSEQsV0FBWSxZQUFZO0lBQ3RCLDJCQUFXLENBQUE7SUFDWCwyQkFBVyxDQUFBO0FBQ2IsQ0FBQyxFQUhXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBR3ZCO0FBMEJELElBQVksYUFHWDtBQUhELFdBQVksYUFBYTtJQUN2Qiw0QkFBVyxDQUFBO0lBQ1gsOEJBQWEsQ0FBQTtBQUNmLENBQUMsRUFIVyxhQUFhLEdBQWIscUJBQWEsS0FBYixxQkFBYSxRQUd4QjtBQUVELElBQVksVUFHWDtBQUhELFdBQVksVUFBVTtJQUNwQixpQ0FBbUIsQ0FBQTtJQUNuQixpQ0FBbUIsQ0FBQTtBQUNyQixDQUFDLEVBSFcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFHckI7QUFXRCxJQUFZLFlBU1g7QUFURCxXQUFZLFlBQVk7SUFDdEIsbURBQW1DLENBQUE7SUFDbkMsdUNBQXVCLENBQUE7SUFDdkIscUNBQXFCLENBQUE7SUFDckIsaUNBQWlCLENBQUE7SUFDakIsdUJBQU8sQ0FBQTtJQUNQLHVCQUFPLENBQUE7SUFDUCx1QkFBTyxDQUFBO0lBQ1AsdUJBQU8sQ0FBQTtBQUNULENBQUMsRUFUVyxZQUFZLEdBQVosb0JBQVksS0FBWixvQkFBWSxRQVN2QiJ9