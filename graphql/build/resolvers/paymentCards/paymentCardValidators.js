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
exports.validatePaymentCard = void 0;
const apollo_server_core_1 = require("apollo-server-core");
exports.validatePaymentCard = new (class {
    exists({ paymentCard, accountingDb, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield accountingDb.findOne({
                collection: "paymentCards",
                filter: {
                    _id: paymentCard,
                },
                options: {
                    projection: {
                        _id: true,
                    },
                },
            }))) {
                throw new apollo_server_core_1.UserInputError(`"PaymentCard" id "${paymentCard.toHexString()} does not exist.`);
            }
        });
    }
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudENhcmRWYWxpZGF0b3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9wYXltZW50Q2FyZHMvcGF5bWVudENhcmRWYWxpZGF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDJEQUFvRDtBQUl2QyxRQUFBLG1CQUFtQixHQUFHLElBQUksQ0FBQztJQUNoQyxNQUFNLENBQUMsRUFDWCxXQUFXLEVBQ1gsWUFBWSxHQUliOztZQUNDLElBQ0UsQ0FBQyxDQUFDLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQztnQkFDM0IsVUFBVSxFQUFFLGNBQWM7Z0JBQzFCLE1BQU0sRUFBRTtvQkFDTixHQUFHLEVBQUUsV0FBVztpQkFDakI7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLFVBQVUsRUFBRTt3QkFDVixHQUFHLEVBQUUsSUFBSTtxQkFDVjtpQkFDRjthQUNGLENBQUMsQ0FBQyxFQUNIO2dCQUNBLE1BQU0sSUFBSSxtQ0FBYyxDQUN0QixxQkFBcUIsV0FBVyxDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FDakUsQ0FBQzthQUNIO1FBQ0gsQ0FBQztLQUFBO0NBQ0YsQ0FBQyxFQUFFLENBQUMifQ==