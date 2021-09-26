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
exports.validateBusiness = void 0;
const apollo_server_core_1 = require("apollo-server-core");
exports.validateBusiness = {
    exists({ business, accountingDb, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield accountingDb.findOne({
                collection: "businesses",
                filter: {
                    _id: business,
                },
                options: {
                    projection: {
                        _id: true,
                    },
                },
            }))) {
                throw new apollo_server_core_1.UserInputError(`"Business" id "${business.toHexString()}" does not exists.`);
            }
        });
    },
    newBusiness({ newBusiness }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (newBusiness.name.length < 3) {
                throw new apollo_server_core_1.UserInputError(`"NewBusiness.name" is too short.`);
            }
        });
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVzaW5lc3NWYWxpZGF0b3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9idXNpbmVzcy9idXNpbmVzc1ZhbGlkYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkRBQW9EO0FBTXZDLFFBQUEsZ0JBQWdCLEdBQUc7SUFDeEIsTUFBTSxDQUFDLEVBQ1gsUUFBUSxFQUNSLFlBQVksR0FJYjs7WUFDQyxJQUNFLENBQUMsQ0FBQyxNQUFNLFlBQVksQ0FBQyxPQUFPLENBQUM7Z0JBQzNCLFVBQVUsRUFBRSxZQUFZO2dCQUN4QixNQUFNLEVBQUU7b0JBQ04sR0FBRyxFQUFFLFFBQVE7aUJBQ2Q7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLFVBQVUsRUFBRTt3QkFDVixHQUFHLEVBQUUsSUFBSTtxQkFDVjtpQkFDRjthQUNGLENBQUMsQ0FBQyxFQUNIO2dCQUNBLE1BQU0sSUFBSSxtQ0FBYyxDQUN0QixrQkFBa0IsUUFBUSxDQUFDLFdBQVcsRUFBRSxvQkFBb0IsQ0FDN0QsQ0FBQzthQUNIO1FBQ0gsQ0FBQztLQUFBO0lBQ0ssV0FBVyxDQUFDLEVBQUUsV0FBVyxFQUFnQzs7WUFDN0QsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQy9CLE1BQU0sSUFBSSxtQ0FBYyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7YUFDOUQ7UUFDSCxDQUFDO0tBQUE7Q0FDTyxDQUFDIn0=