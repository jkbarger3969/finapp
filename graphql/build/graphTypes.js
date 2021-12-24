"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegexFlags = exports.PaymentMethodType = exports.PaymentCardType = exports.EntryType = exports.EntityType = exports.Currency = exports.AliasType = exports.AccountType = void 0;
var AccountType;
(function (AccountType) {
    AccountType["CreditCard"] = "CREDIT_CARD";
    AccountType["Checking"] = "CHECKING";
})(AccountType = exports.AccountType || (exports.AccountType = {}));
var AliasType;
(function (AliasType) {
    AliasType["Alias"] = "ALIAS";
    AliasType["PrefixDescendants"] = "PREFIX_DESCENDANTS";
    AliasType["PostfixDescendants"] = "POSTFIX_DESCENDANTS";
})(AliasType = exports.AliasType || (exports.AliasType = {}));
var Currency;
(function (Currency) {
    Currency["Usd"] = "USD";
})(Currency = exports.Currency || (exports.Currency = {}));
var EntityType;
(function (EntityType) {
    EntityType["Person"] = "PERSON";
    EntityType["Business"] = "BUSINESS";
    EntityType["Department"] = "DEPARTMENT";
})(EntityType = exports.EntityType || (exports.EntityType = {}));
var EntryType;
(function (EntryType) {
    EntryType["Credit"] = "CREDIT";
    EntryType["Debit"] = "DEBIT";
})(EntryType = exports.EntryType || (exports.EntryType = {}));
var PaymentCardType;
(function (PaymentCardType) {
    PaymentCardType["Visa"] = "VISA";
    PaymentCardType["MasterCard"] = "MASTER_CARD";
    PaymentCardType["AmericanExpress"] = "AMERICAN_EXPRESS";
    PaymentCardType["Discover"] = "DISCOVER";
})(PaymentCardType = exports.PaymentCardType || (exports.PaymentCardType = {}));
var PaymentMethodType;
(function (PaymentMethodType) {
    PaymentMethodType["Card"] = "CARD";
    PaymentMethodType["Check"] = "CHECK";
    PaymentMethodType["Cash"] = "CASH";
    PaymentMethodType["Online"] = "ONLINE";
    PaymentMethodType["Combination"] = "COMBINATION";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JhcGhUeXBlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9ncmFwaFR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQXFGQSxJQUFZLFdBR1g7QUFIRCxXQUFZLFdBQVc7SUFDckIseUNBQTBCLENBQUE7SUFDMUIsb0NBQXFCLENBQUE7QUFDdkIsQ0FBQyxFQUhXLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBR3RCO0FBaURELElBQVksU0FJWDtBQUpELFdBQVksU0FBUztJQUNuQiw0QkFBZSxDQUFBO0lBQ2YscURBQXdDLENBQUE7SUFDeEMsdURBQTBDLENBQUE7QUFDNUMsQ0FBQyxFQUpXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBSXBCO0FBbUZELElBQVksUUFFWDtBQUZELFdBQVksUUFBUTtJQUNsQix1QkFBVyxDQUFBO0FBQ2IsQ0FBQyxFQUZXLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBRW5CO0FBMkRELElBQVksVUFJWDtBQUpELFdBQVksVUFBVTtJQUNwQiwrQkFBaUIsQ0FBQTtJQUNqQixtQ0FBcUIsQ0FBQTtJQUNyQix1Q0FBeUIsQ0FBQTtBQUMzQixDQUFDLEVBSlcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFJckI7QUFtSEQsSUFBWSxTQUdYO0FBSEQsV0FBWSxTQUFTO0lBQ25CLDhCQUFpQixDQUFBO0lBQ2pCLDRCQUFlLENBQUE7QUFDakIsQ0FBQyxFQUhXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBR3BCO0FBaUpELElBQVksZUFLWDtBQUxELFdBQVksZUFBZTtJQUN6QixnQ0FBYSxDQUFBO0lBQ2IsNkNBQTBCLENBQUE7SUFDMUIsdURBQW9DLENBQUE7SUFDcEMsd0NBQXFCLENBQUE7QUFDdkIsQ0FBQyxFQUxXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBSzFCO0FBK0VELElBQVksaUJBT1g7QUFQRCxXQUFZLGlCQUFpQjtJQUMzQixrQ0FBYSxDQUFBO0lBQ2Isb0NBQWUsQ0FBQTtJQUNmLGtDQUFhLENBQUE7SUFDYixzQ0FBaUIsQ0FBQTtJQUNqQixnREFBMkIsQ0FBQTtJQUMzQix3Q0FBbUIsQ0FBQTtBQUNyQixDQUFDLEVBUFcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFPNUI7QUFvTkQsc0hBQXNIO0FBQ3RILElBQVksVUFTWDtBQVRELFdBQVksVUFBVTtJQUNwQixxQkFBcUI7SUFDckIscUJBQU8sQ0FBQTtJQUNQLCtCQUErQjtJQUMvQixxQkFBTyxDQUFBO0lBQ1AseUJBQXlCO0lBQ3pCLHFCQUFPLENBQUE7SUFDUCw0Q0FBNEM7SUFDNUMscUJBQU8sQ0FBQTtBQUNULENBQUMsRUFUVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQVNyQiJ9