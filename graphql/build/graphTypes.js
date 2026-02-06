"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegexFlags = exports.PaymentMethodType = exports.PaymentCardType = exports.EntryType = exports.EntityType = exports.Currency = exports.AccountType = void 0;
var AccountType;
(function (AccountType) {
    AccountType["Checking"] = "CHECKING";
    AccountType["CreditCard"] = "CREDIT_CARD";
})(AccountType = exports.AccountType || (exports.AccountType = {}));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JhcGhUeXBlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9ncmFwaFR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQXFHQSxJQUFZLFdBR1g7QUFIRCxXQUFZLFdBQVc7SUFDckIsb0NBQXFCLENBQUE7SUFDckIseUNBQTBCLENBQUE7QUFDNUIsQ0FBQyxFQUhXLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBR3RCO0FBZ0xELElBQVksUUFFWDtBQUZELFdBQVksUUFBUTtJQUNsQix1QkFBVyxDQUFBO0FBQ2IsQ0FBQyxFQUZXLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBRW5CO0FBeUVELElBQVksVUFJWDtBQUpELFdBQVksVUFBVTtJQUNwQixtQ0FBcUIsQ0FBQTtJQUNyQix1Q0FBeUIsQ0FBQTtJQUN6QiwrQkFBaUIsQ0FBQTtBQUNuQixDQUFDLEVBSlcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFJckI7QUF5SEQsSUFBWSxTQUdYO0FBSEQsV0FBWSxTQUFTO0lBQ25CLDhCQUFpQixDQUFBO0lBQ2pCLDRCQUFlLENBQUE7QUFDakIsQ0FBQyxFQUhXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBR3BCO0FBOExELElBQVksZUFLWDtBQUxELFdBQVksZUFBZTtJQUN6Qix1REFBb0MsQ0FBQTtJQUNwQyx3Q0FBcUIsQ0FBQTtJQUNyQiw2Q0FBMEIsQ0FBQTtJQUMxQixnQ0FBYSxDQUFBO0FBQ2YsQ0FBQyxFQUxXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBSzFCO0FBK0VELElBQVksaUJBT1g7QUFQRCxXQUFZLGlCQUFpQjtJQUMzQixrQ0FBYSxDQUFBO0lBQ2Isa0NBQWEsQ0FBQTtJQUNiLG9DQUFlLENBQUE7SUFDZixnREFBMkIsQ0FBQTtJQUMzQixzQ0FBaUIsQ0FBQTtJQUNqQix3Q0FBbUIsQ0FBQTtBQUNyQixDQUFDLEVBUFcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFPNUI7QUFzTkQsc0hBQXNIO0FBQ3RILElBQVksVUFTWDtBQVRELFdBQVksVUFBVTtJQUNwQixxQkFBcUI7SUFDckIscUJBQU8sQ0FBQTtJQUNQLCtCQUErQjtJQUMvQixxQkFBTyxDQUFBO0lBQ1AseUJBQXlCO0lBQ3pCLHFCQUFPLENBQUE7SUFDUCw0Q0FBNEM7SUFDNUMscUJBQU8sQ0FBQTtBQUNULENBQUMsRUFUVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQVNyQiJ9