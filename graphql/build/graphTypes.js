"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.UserRole = exports.RegexFlags = exports.PaymentMethodType = exports.PaymentCardType = exports.EntryType = exports.EntityType = exports.Currency = exports.AuditAction = exports.AccountType = exports.AccessLevel = void 0;
var AccessLevel;
(function (AccessLevel) {
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
    UserRole["SuperAdmin"] = "SUPER_ADMIN";
    UserRole["User"] = "USER";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["Active"] = "ACTIVE";
    UserStatus["Disabled"] = "DISABLED";
    UserStatus["Invited"] = "INVITED";
})(UserStatus = exports.UserStatus || (exports.UserStatus = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JhcGhUeXBlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9ncmFwaFR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQWdDQSxJQUFZLFdBR1g7QUFIRCxXQUFZLFdBQVc7SUFDckIsNEJBQWEsQ0FBQTtJQUNiLDRCQUFhLENBQUE7QUFDZixDQUFDLEVBSFcsV0FBVyxHQUFYLG1CQUFXLEtBQVgsbUJBQVcsUUFHdEI7QUF1RUQsSUFBWSxXQUdYO0FBSEQsV0FBWSxXQUFXO0lBQ3JCLG9DQUFxQixDQUFBO0lBQ3JCLHlDQUEwQixDQUFBO0FBQzVCLENBQUMsRUFIVyxXQUFXLEdBQVgsbUJBQVcsS0FBWCxtQkFBVyxRQUd0QjtBQXVHRCxJQUFZLFdBcUJYO0FBckJELFdBQVksV0FBVztJQUNyQiwyQ0FBNEIsQ0FBQTtJQUM1QiwyQ0FBNEIsQ0FBQTtJQUM1QiwyQ0FBNEIsQ0FBQTtJQUM1Qix3REFBeUMsQ0FBQTtJQUN6QyxzREFBdUMsQ0FBQTtJQUN2Qyx3REFBeUMsQ0FBQTtJQUN6Qyw4QkFBZSxDQUFBO0lBQ2YsZ0NBQWlCLENBQUE7SUFDakIsbURBQW9DLENBQUE7SUFDcEMscURBQXNDLENBQUE7SUFDdEMsK0NBQWdDLENBQUE7SUFDaEMsK0NBQWdDLENBQUE7SUFDaEMsc0NBQXVCLENBQUE7SUFDdkIsNkNBQThCLENBQUE7SUFDOUIsNkNBQThCLENBQUE7SUFDOUIsNkNBQThCLENBQUE7SUFDOUIseUNBQTBCLENBQUE7SUFDMUIsMkNBQTRCLENBQUE7SUFDNUIseUNBQTBCLENBQUE7SUFDMUIseUNBQTBCLENBQUE7QUFDNUIsQ0FBQyxFQXJCVyxXQUFXLEdBQVgsbUJBQVcsS0FBWCxtQkFBVyxRQXFCdEI7QUFnSkQsSUFBWSxRQUVYO0FBRkQsV0FBWSxRQUFRO0lBQ2xCLHVCQUFXLENBQUE7QUFDYixDQUFDLEVBRlcsUUFBUSxHQUFSLGdCQUFRLEtBQVIsZ0JBQVEsUUFFbkI7QUFtR0QsSUFBWSxVQUlYO0FBSkQsV0FBWSxVQUFVO0lBQ3BCLG1DQUFxQixDQUFBO0lBQ3JCLHVDQUF5QixDQUFBO0lBQ3pCLCtCQUFpQixDQUFBO0FBQ25CLENBQUMsRUFKVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQUlyQjtBQWlJRCxJQUFZLFNBR1g7QUFIRCxXQUFZLFNBQVM7SUFDbkIsOEJBQWlCLENBQUE7SUFDakIsNEJBQWUsQ0FBQTtBQUNqQixDQUFDLEVBSFcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFHcEI7QUFpVUQsSUFBWSxlQUtYO0FBTEQsV0FBWSxlQUFlO0lBQ3pCLHVEQUFvQyxDQUFBO0lBQ3BDLHdDQUFxQixDQUFBO0lBQ3JCLDZDQUEwQixDQUFBO0lBQzFCLGdDQUFhLENBQUE7QUFDZixDQUFDLEVBTFcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFLMUI7QUErRUQsSUFBWSxpQkFPWDtBQVBELFdBQVksaUJBQWlCO0lBQzNCLGtDQUFhLENBQUE7SUFDYixrQ0FBYSxDQUFBO0lBQ2Isb0NBQWUsQ0FBQTtJQUNmLGdEQUEyQixDQUFBO0lBQzNCLHNDQUFpQixDQUFBO0lBQ2pCLHdDQUFtQixDQUFBO0FBQ3JCLENBQUMsRUFQVyxpQkFBaUIsR0FBakIseUJBQWlCLEtBQWpCLHlCQUFpQixRQU81QjtBQWtSRCxzSEFBc0g7QUFDdEgsSUFBWSxVQVNYO0FBVEQsV0FBWSxVQUFVO0lBQ3BCLHFCQUFxQjtJQUNyQixxQkFBTyxDQUFBO0lBQ1AsK0JBQStCO0lBQy9CLHFCQUFPLENBQUE7SUFDUCx5QkFBeUI7SUFDekIscUJBQU8sQ0FBQTtJQUNQLDRDQUE0QztJQUM1QyxxQkFBTyxDQUFBO0FBQ1QsQ0FBQyxFQVRXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBU3JCO0FBb0tELElBQVksUUFHWDtBQUhELFdBQVksUUFBUTtJQUNsQixzQ0FBMEIsQ0FBQTtJQUMxQix5QkFBYSxDQUFBO0FBQ2YsQ0FBQyxFQUhXLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBR25CO0FBRUQsSUFBWSxVQUlYO0FBSkQsV0FBWSxVQUFVO0lBQ3BCLCtCQUFpQixDQUFBO0lBQ2pCLG1DQUFxQixDQUFBO0lBQ3JCLGlDQUFtQixDQUFBO0FBQ3JCLENBQUMsRUFKVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQUlyQiJ9