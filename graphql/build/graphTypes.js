"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.UserRole = exports.RegexFlags = exports.PaymentMethodType = exports.PaymentCardType = exports.EntryType = exports.EntityType = exports.Currency = exports.AuditAction = exports.AccountType = exports.AccessLevel = void 0;
var AccessLevel;
(function (AccessLevel) {
    AccessLevel["Admin"] = "ADMIN";
    AccessLevel["Edit"] = "EDIT";
    AccessLevel["View"] = "VIEW";
})(AccessLevel = exports.AccessLevel || (exports.AccessLevel = {}));
var AccountType;
(function (AccountType) {
    AccountType["Checking"] = "CHECKING";
    AccountType["CreditCard"] = "CREDIT_CARD";
})(AccountType = exports.AccountType || (exports.AccountType = {}));
var AuditAction;
(function (AuditAction) {
    AuditAction["EntryCreate"] = "ENTRY_CREATE";
    AuditAction["EntryDelete"] = "ENTRY_DELETE";
    AuditAction["EntryUpdate"] = "ENTRY_UPDATE";
    AuditAction["FiscalYearArchive"] = "FISCAL_YEAR_ARCHIVE";
    AuditAction["FiscalYearDelete"] = "FISCAL_YEAR_DELETE";
    AuditAction["FiscalYearRestore"] = "FISCAL_YEAR_RESTORE";
    AuditAction["Login"] = "LOGIN";
    AuditAction["Logout"] = "LOGOUT";
    AuditAction["PermissionGrant"] = "PERMISSION_GRANT";
    AuditAction["PermissionRevoke"] = "PERMISSION_REVOKE";
    AuditAction["ReceiptDelete"] = "RECEIPT_DELETE";
    AuditAction["ReceiptUpload"] = "RECEIPT_UPLOAD";
    AuditAction["Reconcile"] = "RECONCILE";
    AuditAction["RefundCreate"] = "REFUND_CREATE";
    AuditAction["RefundDelete"] = "REFUND_DELETE";
    AuditAction["RefundUpdate"] = "REFUND_UPDATE";
    AuditAction["UserDelete"] = "USER_DELETE";
    AuditAction["UserDisable"] = "USER_DISABLE";
    AuditAction["UserInvite"] = "USER_INVITE";
    AuditAction["UserUpdate"] = "USER_UPDATE";
})(AuditAction = exports.AuditAction || (exports.AuditAction = {}));
var Currency;
(function (Currency) {
    Currency["Usd"] = "USD";
})(Currency = exports.Currency || (exports.Currency = {}));
var EntityType;
(function (EntityType) {
    EntityType["Business"] = "BUSINESS";
    EntityType["Department"] = "DEPARTMENT";
    EntityType["Person"] = "PERSON";
})(EntityType = exports.EntityType || (exports.EntityType = {}));
var EntryType;
(function (EntryType) {
    EntryType["Credit"] = "CREDIT";
    EntryType["Debit"] = "DEBIT";
})(EntryType = exports.EntryType || (exports.EntryType = {}));
var PaymentCardType;
(function (PaymentCardType) {
    PaymentCardType["AmericanExpress"] = "AMERICAN_EXPRESS";
    PaymentCardType["Discover"] = "DISCOVER";
    PaymentCardType["MasterCard"] = "MASTER_CARD";
    PaymentCardType["Visa"] = "VISA";
})(PaymentCardType = exports.PaymentCardType || (exports.PaymentCardType = {}));
var PaymentMethodType;
(function (PaymentMethodType) {
    PaymentMethodType["Card"] = "CARD";
    PaymentMethodType["Cash"] = "CASH";
    PaymentMethodType["Check"] = "CHECK";
    PaymentMethodType["Combination"] = "COMBINATION";
    PaymentMethodType["Online"] = "ONLINE";
    PaymentMethodType["Unknown"] = "UNKNOWN";
})(PaymentMethodType = exports.PaymentMethodType || (exports.PaymentMethodType = {}));
/** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#advanced_searching_with_flags */
var RegexFlags;
(function (RegexFlags) {
    /** Global search. */
    RegexFlags["G"] = "G";
    /** Case-insensitive search. */
    RegexFlags["I"] = "I";
    /** Multi-line search. */
    RegexFlags["M"] = "M";
    /** Allows . to match newline characters. */
    RegexFlags["S"] = "S";
})(RegexFlags = exports.RegexFlags || (exports.RegexFlags = {}));
var UserRole;
(function (UserRole) {
    UserRole["DeptAdmin"] = "DEPT_ADMIN";
    UserRole["SuperAdmin"] = "SUPER_ADMIN";
    UserRole["User"] = "USER";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["Active"] = "ACTIVE";
    UserStatus["Disabled"] = "DISABLED";
    UserStatus["Invited"] = "INVITED";
})(UserStatus = exports.UserStatus || (exports.UserStatus = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JhcGhUeXBlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9ncmFwaFR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQWdDQSxJQUFZLFdBSVg7QUFKRCxXQUFZLFdBQVc7SUFDckIsOEJBQWUsQ0FBQTtJQUNmLDRCQUFhLENBQUE7SUFDYiw0QkFBYSxDQUFBO0FBQ2YsQ0FBQyxFQUpXLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBSXRCO0FBdUVELElBQVksV0FHWDtBQUhELFdBQVksV0FBVztJQUNyQixvQ0FBcUIsQ0FBQTtJQUNyQix5Q0FBMEIsQ0FBQTtBQUM1QixDQUFDLEVBSFcsV0FBVyxHQUFYLG1CQUFXLEtBQVgsbUJBQVcsUUFHdEI7QUF1R0QsSUFBWSxXQXFCWDtBQXJCRCxXQUFZLFdBQVc7SUFDckIsMkNBQTRCLENBQUE7SUFDNUIsMkNBQTRCLENBQUE7SUFDNUIsMkNBQTRCLENBQUE7SUFDNUIsd0RBQXlDLENBQUE7SUFDekMsc0RBQXVDLENBQUE7SUFDdkMsd0RBQXlDLENBQUE7SUFDekMsOEJBQWUsQ0FBQTtJQUNmLGdDQUFpQixDQUFBO0lBQ2pCLG1EQUFvQyxDQUFBO0lBQ3BDLHFEQUFzQyxDQUFBO0lBQ3RDLCtDQUFnQyxDQUFBO0lBQ2hDLCtDQUFnQyxDQUFBO0lBQ2hDLHNDQUF1QixDQUFBO0lBQ3ZCLDZDQUE4QixDQUFBO0lBQzlCLDZDQUE4QixDQUFBO0lBQzlCLDZDQUE4QixDQUFBO0lBQzlCLHlDQUEwQixDQUFBO0lBQzFCLDJDQUE0QixDQUFBO0lBQzVCLHlDQUEwQixDQUFBO0lBQzFCLHlDQUEwQixDQUFBO0FBQzVCLENBQUMsRUFyQlcsV0FBVyxHQUFYLG1CQUFXLEtBQVgsbUJBQVcsUUFxQnRCO0FBc0lELElBQVksUUFFWDtBQUZELFdBQVksUUFBUTtJQUNsQix1QkFBVyxDQUFBO0FBQ2IsQ0FBQyxFQUZXLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBRW5CO0FBeUZELElBQVksVUFJWDtBQUpELFdBQVksVUFBVTtJQUNwQixtQ0FBcUIsQ0FBQTtJQUNyQix1Q0FBeUIsQ0FBQTtJQUN6QiwrQkFBaUIsQ0FBQTtBQUNuQixDQUFDLEVBSlcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFJckI7QUEwSEQsSUFBWSxTQUdYO0FBSEQsV0FBWSxTQUFTO0lBQ25CLDhCQUFpQixDQUFBO0lBQ2pCLDRCQUFlLENBQUE7QUFDakIsQ0FBQyxFQUhXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBR3BCO0FBMlNELElBQVksZUFLWDtBQUxELFdBQVksZUFBZTtJQUN6Qix1REFBb0MsQ0FBQTtJQUNwQyx3Q0FBcUIsQ0FBQTtJQUNyQiw2Q0FBMEIsQ0FBQTtJQUMxQixnQ0FBYSxDQUFBO0FBQ2YsQ0FBQyxFQUxXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBSzFCO0FBK0VELElBQVksaUJBT1g7QUFQRCxXQUFZLGlCQUFpQjtJQUMzQixrQ0FBYSxDQUFBO0lBQ2Isa0NBQWEsQ0FBQTtJQUNiLG9DQUFlLENBQUE7SUFDZixnREFBMkIsQ0FBQTtJQUMzQixzQ0FBaUIsQ0FBQTtJQUNqQix3Q0FBbUIsQ0FBQTtBQUNyQixDQUFDLEVBUFcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFPNUI7QUFtUUQsc0hBQXNIO0FBQ3RILElBQVksVUFTWDtBQVRELFdBQVksVUFBVTtJQUNwQixxQkFBcUI7SUFDckIscUJBQU8sQ0FBQTtJQUNQLCtCQUErQjtJQUMvQixxQkFBTyxDQUFBO0lBQ1AseUJBQXlCO0lBQ3pCLHFCQUFPLENBQUE7SUFDUCw0Q0FBNEM7SUFDNUMscUJBQU8sQ0FBQTtBQUNULENBQUMsRUFUVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQVNyQjtBQWdJRCxJQUFZLFFBSVg7QUFKRCxXQUFZLFFBQVE7SUFDbEIsb0NBQXdCLENBQUE7SUFDeEIsc0NBQTBCLENBQUE7SUFDMUIseUJBQWEsQ0FBQTtBQUNmLENBQUMsRUFKVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQUluQjtBQUVELElBQVksVUFJWDtBQUpELFdBQVksVUFBVTtJQUNwQiwrQkFBaUIsQ0FBQTtJQUNqQixtQ0FBcUIsQ0FBQTtJQUNyQixpQ0FBbUIsQ0FBQTtBQUNyQixDQUFDLEVBSlcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFJckIifQ==