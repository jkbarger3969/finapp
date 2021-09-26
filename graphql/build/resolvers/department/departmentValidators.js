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
exports.validateDepartment = void 0;
const apollo_server_core_1 = require("apollo-server-core");
exports.validateDepartment = {
    exists: ({ department, accountingDb, }) => __awaiter(void 0, void 0, void 0, function* () {
        if (!(yield accountingDb.findOne({
            collection: "departments",
            filter: {
                _id: department,
            },
            options: {
                projection: { _id: true },
            },
        }))) {
            throw new apollo_server_core_1.UserInputError(`"Department" id "${department.toHexString()}" does not exists.`);
        }
    }),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVwYXJ0bWVudFZhbGlkYXRvcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2RlcGFydG1lbnQvRGVwYXJ0bWVudFZhbGlkYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkRBQW9EO0FBS3ZDLFFBQUEsa0JBQWtCLEdBQUc7SUFDaEMsTUFBTSxFQUFFLENBQU8sRUFDYixVQUFVLEVBQ1YsWUFBWSxHQUliLEVBQUUsRUFBRTtRQUNILElBQ0UsQ0FBQyxDQUFDLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQztZQUMzQixVQUFVLEVBQUUsYUFBYTtZQUN6QixNQUFNLEVBQUU7Z0JBQ04sR0FBRyxFQUFFLFVBQVU7YUFDaEI7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTthQUMxQjtTQUNGLENBQUMsQ0FBQyxFQUNIO1lBQ0EsTUFBTSxJQUFJLG1DQUFjLENBQ3RCLG9CQUFvQixVQUFVLENBQUMsV0FBVyxFQUFFLG9CQUFvQixDQUNqRSxDQUFDO1NBQ0g7SUFDSCxDQUFDLENBQUE7Q0FDTyxDQUFDIn0=