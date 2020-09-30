"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JhcGhUeXBlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9ncmFwaFR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBOEJBLElBQVksZUFHWDtBQUhELFdBQVksZUFBZTtJQUN6Qix3Q0FBcUIsQ0FBQTtJQUNyQiw0Q0FBeUIsQ0FBQTtBQUMzQixDQUFDLEVBSFcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFHMUI7QUFtRkQsSUFBWSxzQkFHWDtBQUhELFdBQVksc0JBQXNCO0lBQ2hDLCtDQUFxQixDQUFBO0lBQ3JCLG1EQUF5QixDQUFBO0FBQzNCLENBQUMsRUFIVyxzQkFBc0IsR0FBdEIsOEJBQXNCLEtBQXRCLDhCQUFzQixRQUdqQztBQXFCRCxJQUFZLFVBR1g7QUFIRCxXQUFZLFVBQVU7SUFDcEIsaUNBQW1CLENBQUE7SUFDbkIsaUNBQW1CLENBQUE7QUFDckIsQ0FBQyxFQUhXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBR3JCO0FBMk5ELElBQVksc0JBSVg7QUFKRCxXQUFZLHNCQUFzQjtJQUNoQywrQ0FBcUIsQ0FBQTtJQUNyQixtREFBeUIsQ0FBQTtJQUN6QiwyQ0FBaUIsQ0FBQTtBQUNuQixDQUFDLEVBSlcsc0JBQXNCLEdBQXRCLDhCQUFzQixLQUF0Qiw4QkFBc0IsUUFJakM7QUFFRCxJQUFZLGdCQUdYO0FBSEQsV0FBWSxnQkFBZ0I7SUFDMUIscUNBQWlCLENBQUE7SUFDakIsbUNBQWUsQ0FBQTtBQUNqQixDQUFDLEVBSFcsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUFHM0I7QUFpWEQsSUFBWSxZQUdYO0FBSEQsV0FBWSxZQUFZO0lBQ3RCLDJCQUFXLENBQUE7SUFDWCwyQkFBVyxDQUFBO0FBQ2IsQ0FBQyxFQUhXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBR3ZCO0FBRUQsSUFBWSxZQVNYO0FBVEQsV0FBWSxZQUFZO0lBQ3RCLG1EQUFtQyxDQUFBO0lBQ25DLHVDQUF1QixDQUFBO0lBQ3ZCLHFDQUFxQixDQUFBO0lBQ3JCLGlDQUFpQixDQUFBO0lBQ2pCLHVCQUFPLENBQUE7SUFDUCx1QkFBTyxDQUFBO0lBQ1AsdUJBQU8sQ0FBQTtJQUNQLHVCQUFPLENBQUE7QUFDVCxDQUFDLEVBVFcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUFTdkI7QUFFRCxJQUFZLGFBR1g7QUFIRCxXQUFZLGFBQWE7SUFDdkIsNEJBQVcsQ0FBQTtJQUNYLDhCQUFhLENBQUE7QUFDZixDQUFDLEVBSFcsYUFBYSxHQUFiLHFCQUFhLEtBQWIscUJBQWEsUUFHeEIifQ==