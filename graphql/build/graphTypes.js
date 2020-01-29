"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FilterType;
(function (FilterType) {
    FilterType["Include"] = "INCLUDE";
    FilterType["Exclude"] = "EXCLUDE";
})(FilterType = exports.FilterType || (exports.FilterType = {}));
var JournalEntiresReconciledFilter;
(function (JournalEntiresReconciledFilter) {
    JournalEntiresReconciledFilter["Reconciled"] = "RECONCILED";
    JournalEntiresReconciledFilter["NotReconciled"] = "NOT_RECONCILED";
})(JournalEntiresReconciledFilter = exports.JournalEntiresReconciledFilter || (exports.JournalEntiresReconciledFilter = {}));
var JournalEntriesColumn;
(function (JournalEntriesColumn) {
    JournalEntriesColumn["Department"] = "DEPARTMENT";
    JournalEntriesColumn["Type"] = "TYPE";
    JournalEntriesColumn["Category"] = "CATEGORY";
    /** ROOT_TYPE */
    JournalEntriesColumn["PaymentMethod"] = "PAYMENT_METHOD";
    JournalEntriesColumn["Total"] = "TOTAL";
    JournalEntriesColumn["Date"] = "DATE";
    JournalEntriesColumn["Source"] = "SOURCE";
})(JournalEntriesColumn = exports.JournalEntriesColumn || (exports.JournalEntriesColumn = {}));
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
var SortDirection;
(function (SortDirection) {
    SortDirection["Asc"] = "ASC";
    SortDirection["Desc"] = "DESC";
})(SortDirection = exports.SortDirection || (exports.SortDirection = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JhcGhUeXBlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9ncmFwaFR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBMkRBLElBQVksVUFHWDtBQUhELFdBQVksVUFBVTtJQUNwQixpQ0FBbUIsQ0FBQTtJQUNuQixpQ0FBbUIsQ0FBQTtBQUNyQixDQUFDLEVBSFcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFHckI7QUFPRCxJQUFZLDhCQUdYO0FBSEQsV0FBWSw4QkFBOEI7SUFDeEMsMkRBQXlCLENBQUE7SUFDekIsa0VBQWdDLENBQUE7QUFDbEMsQ0FBQyxFQUhXLDhCQUE4QixHQUE5QixzQ0FBOEIsS0FBOUIsc0NBQThCLFFBR3pDO0FBRUQsSUFBWSxvQkFTWDtBQVRELFdBQVksb0JBQW9CO0lBQzlCLGlEQUF5QixDQUFBO0lBQ3pCLHFDQUFhLENBQUE7SUFDYiw2Q0FBcUIsQ0FBQTtJQUNyQixnQkFBZ0I7SUFDaEIsd0RBQWdDLENBQUE7SUFDaEMsdUNBQWUsQ0FBQTtJQUNmLHFDQUFhLENBQUE7SUFDYix5Q0FBaUIsQ0FBQTtBQUNuQixDQUFDLEVBVFcsb0JBQW9CLEdBQXBCLDRCQUFvQixLQUFwQiw0QkFBb0IsUUFTL0I7QUE4REQsSUFBWSxzQkFJWDtBQUpELFdBQVksc0JBQXNCO0lBQ2hDLCtDQUFxQixDQUFBO0lBQ3JCLG1EQUF5QixDQUFBO0lBQ3pCLDJDQUFpQixDQUFBO0FBQ25CLENBQUMsRUFKVyxzQkFBc0IsR0FBdEIsOEJBQXNCLEtBQXRCLDhCQUFzQixRQUlqQztBQUVELElBQVksZ0JBR1g7QUFIRCxXQUFZLGdCQUFnQjtJQUMxQixxQ0FBaUIsQ0FBQTtJQUNqQixtQ0FBZSxDQUFBO0FBQ2pCLENBQUMsRUFIVyxnQkFBZ0IsR0FBaEIsd0JBQWdCLEtBQWhCLHdCQUFnQixRQUczQjtBQXlKRCxJQUFZLGFBR1g7QUFIRCxXQUFZLGFBQWE7SUFDdkIsNEJBQVcsQ0FBQTtJQUNYLDhCQUFhLENBQUE7QUFDZixDQUFDLEVBSFcsYUFBYSxHQUFiLHFCQUFhLEtBQWIscUJBQWEsUUFHeEIifQ==