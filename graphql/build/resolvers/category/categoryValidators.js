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
exports.validateCategory = void 0;
const apollo_server_core_1 = require("apollo-server-core");
exports.validateCategory = {
    exists: ({ category, accountingDb, }) => __awaiter(void 0, void 0, void 0, function* () {
        if (!(yield accountingDb.findOne({
            collection: "categories",
            filter: {
                _id: category,
            },
            options: {
                projection: { _id: true },
            },
        }))) {
            throw new apollo_server_core_1.UserInputError(`"Category" id "${category.toHexString()}" does not exists.`);
        }
    }),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2F0ZWdvcnlWYWxpZGF0b3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9jYXRlZ29yeS9jYXRlZ29yeVZhbGlkYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkRBQW9EO0FBS3ZDLFFBQUEsZ0JBQWdCLEdBQUc7SUFDOUIsTUFBTSxFQUFFLENBQU8sRUFDYixRQUFRLEVBQ1IsWUFBWSxHQUliLEVBQUUsRUFBRTtRQUNILElBQ0UsQ0FBQyxDQUFDLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQztZQUMzQixVQUFVLEVBQUUsWUFBWTtZQUN4QixNQUFNLEVBQUU7Z0JBQ04sR0FBRyxFQUFFLFFBQVE7YUFDZDtZQUNELE9BQU8sRUFBRTtnQkFDUCxVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO2FBQzFCO1NBQ0YsQ0FBQyxDQUFDLEVBQ0g7WUFDQSxNQUFNLElBQUksbUNBQWMsQ0FDdEIsa0JBQWtCLFFBQVEsQ0FBQyxXQUFXLEVBQUUsb0JBQW9CLENBQzdELENBQUM7U0FDSDtJQUNILENBQUMsQ0FBQTtDQUNPLENBQUMifQ==