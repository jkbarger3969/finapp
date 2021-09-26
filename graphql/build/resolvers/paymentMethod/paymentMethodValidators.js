"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePaymentMethod = void 0;
const apollo_server_core_1 = require("apollo-server-core");
const mongodb_1 = require("mongodb");
const account_1 = require("../account");
const paymentCards_1 = require("../paymentCards");
exports.validatePaymentMethod = new (class {
    upsertPaymentMethod({ upsertPaymentMethod, accountingDb, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const [field, ...restFields] = Object.keys(upsertPaymentMethod);
            if (!field) {
                throw new apollo_server_core_1.UserInputError(`"UpsertPaymentMethod" requires one field."`);
            }
            else if (restFields.length) {
                throw new apollo_server_core_1.UserInputError(`"UpsertPaymentMethod.${field}" is mutually exclusive to  ${restFields
                    .map((field) => `"UpsertPaymentMethod.${field}"`)
                    .join(", ")}.`);
            }
            switch (field) {
                case "accountCard":
                    yield paymentCards_1.validatePaymentCard.exists({
                        paymentCard: new mongodb_1.ObjectId(upsertPaymentMethod[field].card),
                        accountingDb,
                    });
                    break;
                case "accountCheck":
                    yield account_1.validateAccount.exists({
                        account: new mongodb_1.ObjectId(upsertPaymentMethod[field].check.account),
                        accountingDb,
                    });
                    break;
                case "card":
                case "cash":
                case "check":
                case "combination":
                case "online":
                case "unknown":
                    break;
            }
        });
    }
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudE1ldGhvZFZhbGlkYXRvcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL3BheW1lbnRNZXRob2QvcGF5bWVudE1ldGhvZFZhbGlkYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkRBQW9EO0FBQ3BELHFDQUFtQztBQUluQyx3Q0FBNkM7QUFDN0Msa0RBQXNEO0FBRXpDLFFBQUEscUJBQXFCLEdBQUcsSUFBSSxDQUFDO0lBQ2xDLG1CQUFtQixDQUFDLEVBQ3hCLG1CQUFtQixFQUNuQixZQUFZLEdBSWI7O1lBQ0MsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLFVBQVUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQ3hDLG1CQUFtQixDQUNhLENBQUM7WUFFbkMsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDVixNQUFNLElBQUksbUNBQWMsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO2FBQ3hFO2lCQUFNLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRTtnQkFDNUIsTUFBTSxJQUFJLG1DQUFjLENBQ3RCLHdCQUF3QixLQUFLLCtCQUErQixVQUFVO3FCQUNuRSxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLHdCQUF3QixLQUFLLEdBQUcsQ0FBQztxQkFDaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQ2pCLENBQUM7YUFDSDtZQUVELFFBQVEsS0FBSyxFQUFFO2dCQUNiLEtBQUssYUFBYTtvQkFDaEIsTUFBTSxrQ0FBbUIsQ0FBQyxNQUFNLENBQUM7d0JBQy9CLFdBQVcsRUFBRSxJQUFJLGtCQUFRLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDO3dCQUMxRCxZQUFZO3FCQUNiLENBQUMsQ0FBQztvQkFDSCxNQUFNO2dCQUNSLEtBQUssY0FBYztvQkFDakIsTUFBTSx5QkFBZSxDQUFDLE1BQU0sQ0FBQzt3QkFDM0IsT0FBTyxFQUFFLElBQUksa0JBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO3dCQUMvRCxZQUFZO3FCQUNiLENBQUMsQ0FBQztvQkFDSCxNQUFNO2dCQUNSLEtBQUssTUFBTSxDQUFDO2dCQUNaLEtBQUssTUFBTSxDQUFDO2dCQUNaLEtBQUssT0FBTyxDQUFDO2dCQUNiLEtBQUssYUFBYSxDQUFDO2dCQUNuQixLQUFLLFFBQVEsQ0FBQztnQkFDZCxLQUFLLFNBQVM7b0JBQ1osTUFBTTthQUNUO1FBQ0gsQ0FBQztLQUFBO0NBQ0YsQ0FBQyxFQUFFLENBQUMifQ==