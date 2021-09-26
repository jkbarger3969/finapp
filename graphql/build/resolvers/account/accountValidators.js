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
exports.validateAccount = void 0;
const apollo_server_core_1 = require("apollo-server-core");
exports.validateAccount = new (class {
    exists({ account, accountingDb, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield accountingDb.findOne({
                collection: "accounts",
                filter: {
                    _id: account,
                },
                options: {
                    projection: {
                        _id: true,
                    },
                },
            }))) {
                throw new apollo_server_core_1.UserInputError(`"Account" id "${account.toHexString()} does not exist.`);
            }
        });
    }
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudFZhbGlkYXRvcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2FjY291bnQvYWNjb3VudFZhbGlkYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkRBQW9EO0FBSXZDLFFBQUEsZUFBZSxHQUFHLElBQUksQ0FBQztJQUM1QixNQUFNLENBQUMsRUFDWCxPQUFPLEVBQ1AsWUFBWSxHQUliOztZQUNDLElBQ0UsQ0FBQyxDQUFDLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQztnQkFDM0IsVUFBVSxFQUFFLFVBQVU7Z0JBQ3RCLE1BQU0sRUFBRTtvQkFDTixHQUFHLEVBQUUsT0FBTztpQkFDYjtnQkFDRCxPQUFPLEVBQUU7b0JBQ1AsVUFBVSxFQUFFO3dCQUNWLEdBQUcsRUFBRSxJQUFJO3FCQUNWO2lCQUNGO2FBQ0YsQ0FBQyxDQUFDLEVBQ0g7Z0JBQ0EsTUFBTSxJQUFJLG1DQUFjLENBQ3RCLGlCQUFpQixPQUFPLENBQUMsV0FBVyxFQUFFLGtCQUFrQixDQUN6RCxDQUFDO2FBQ0g7UUFDSCxDQUFDO0tBQUE7Q0FDRixDQUFDLEVBQUUsQ0FBQyJ9