"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortDirection = exports.RegexOptions = exports.RationalSign = exports.JournalEntryType = exports.JournalEntrySourceType = exports.FilterType = exports.DepartmentAncestorType = exports.BudgetOwnerType = void 0;
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
var FilterType;
(function (FilterType) {
    FilterType["Include"] = "INCLUDE";
    FilterType["Exclude"] = "EXCLUDE";
})(FilterType = exports.FilterType || (exports.FilterType = {}));
var JournalEntrySourceType;
(function (JournalEntrySourceType) {
    JournalEntrySourceType["Business"] = "BUSINESS";
    JournalEntrySourceType["Department"] = "DEPARTMENT";
    JournalEntrySourceType["Person"] = "PERSON";
})(JournalEntrySourceType = exports.JournalEntrySourceType || (exports.JournalEntrySourceType = {}));
var JournalEntryType;
(function (JournalEntryType) {
    JournalEntryType["Credit"] = "CREDIT";
    JournalEntryType["Debit"] = "DEBIT";
})(JournalEntryType = exports.JournalEntryType || (exports.JournalEntryType = {}));
var RationalSign;
(function (RationalSign) {
    RationalSign["Pos"] = "POS";
    RationalSign["Neg"] = "NEG";
})(RationalSign = exports.RationalSign || (exports.RationalSign = {}));
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
var SortDirection;
(function (SortDirection) {
    SortDirection["Asc"] = "ASC";
    SortDirection["Desc"] = "DESC";
})(SortDirection = exports.SortDirection || (exports.SortDirection = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JhcGhUeXBlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9ncmFwaFR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQThCQSxJQUFZLGVBR1g7QUFIRCxXQUFZLGVBQWU7SUFDekIsd0NBQXFCLENBQUE7SUFDckIsNENBQXlCLENBQUE7QUFDM0IsQ0FBQyxFQUhXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBRzFCO0FBbUZELElBQVksc0JBR1g7QUFIRCxXQUFZLHNCQUFzQjtJQUNoQywrQ0FBcUIsQ0FBQTtJQUNyQixtREFBeUIsQ0FBQTtBQUMzQixDQUFDLEVBSFcsc0JBQXNCLEdBQXRCLDhCQUFzQixLQUF0Qiw4QkFBc0IsUUFHakM7QUFxQkQsSUFBWSxVQUdYO0FBSEQsV0FBWSxVQUFVO0lBQ3BCLGlDQUFtQixDQUFBO0lBQ25CLGlDQUFtQixDQUFBO0FBQ3JCLENBQUMsRUFIVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQUdyQjtBQXFQRCxJQUFZLHNCQUlYO0FBSkQsV0FBWSxzQkFBc0I7SUFDaEMsK0NBQXFCLENBQUE7SUFDckIsbURBQXlCLENBQUE7SUFDekIsMkNBQWlCLENBQUE7QUFDbkIsQ0FBQyxFQUpXLHNCQUFzQixHQUF0Qiw4QkFBc0IsS0FBdEIsOEJBQXNCLFFBSWpDO0FBRUQsSUFBWSxnQkFHWDtBQUhELFdBQVksZ0JBQWdCO0lBQzFCLHFDQUFpQixDQUFBO0lBQ2pCLG1DQUFlLENBQUE7QUFDakIsQ0FBQyxFQUhXLGdCQUFnQixHQUFoQix3QkFBZ0IsS0FBaEIsd0JBQWdCLFFBRzNCO0FBa1hELElBQVksWUFHWDtBQUhELFdBQVksWUFBWTtJQUN0QiwyQkFBVyxDQUFBO0lBQ1gsMkJBQVcsQ0FBQTtBQUNiLENBQUMsRUFIVyxZQUFZLEdBQVosb0JBQVksS0FBWixvQkFBWSxRQUd2QjtBQUVELElBQVksWUFTWDtBQVRELFdBQVksWUFBWTtJQUN0QixtREFBbUMsQ0FBQTtJQUNuQyx1Q0FBdUIsQ0FBQTtJQUN2QixxQ0FBcUIsQ0FBQTtJQUNyQixpQ0FBaUIsQ0FBQTtJQUNqQix1QkFBTyxDQUFBO0lBQ1AsdUJBQU8sQ0FBQTtJQUNQLHVCQUFPLENBQUE7SUFDUCx1QkFBTyxDQUFBO0FBQ1QsQ0FBQyxFQVRXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBU3ZCO0FBRUQsSUFBWSxhQUdYO0FBSEQsV0FBWSxhQUFhO0lBQ3ZCLDRCQUFXLENBQUE7SUFDWCw4QkFBYSxDQUFBO0FBQ2YsQ0FBQyxFQUhXLGFBQWEsR0FBYixxQkFBYSxLQUFiLHFCQUFhLFFBR3hCIn0=