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
exports.validateCategory = new (class {
    exists({ category, accountingDb, }) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    isNotRoot({ category, accountingDb, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { parent } = yield accountingDb.findOne({
                collection: "categories",
                filter: {
                    _id: category,
                },
                options: {
                    projection: { parent: true },
                },
            });
            if (!parent) {
                throw new apollo_server_core_1.UserInputError(`Root category is not permitted. "Category" id "${category.toHexString()}" is a root category.`);
            }
        });
    }
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2F0ZWdvcnlWYWxpZGF0b3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9jYXRlZ29yeS9jYXRlZ29yeVZhbGlkYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkRBQW9EO0FBS3ZDLFFBQUEsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0lBQzdCLE1BQU0sQ0FBQyxFQUNYLFFBQVEsRUFDUixZQUFZLEdBSWI7O1lBQ0MsSUFDRSxDQUFDLENBQUMsTUFBTSxZQUFZLENBQUMsT0FBTyxDQUFDO2dCQUMzQixVQUFVLEVBQUUsWUFBWTtnQkFDeEIsTUFBTSxFQUFFO29CQUNOLEdBQUcsRUFBRSxRQUFRO2lCQUNkO2dCQUNELE9BQU8sRUFBRTtvQkFDUCxVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO2lCQUMxQjthQUNGLENBQUMsQ0FBQyxFQUNIO2dCQUNBLE1BQU0sSUFBSSxtQ0FBYyxDQUN0QixrQkFBa0IsUUFBUSxDQUFDLFdBQVcsRUFBRSxvQkFBb0IsQ0FDN0QsQ0FBQzthQUNIO1FBQ0gsQ0FBQztLQUFBO0lBQ0ssU0FBUyxDQUFDLEVBQ2QsUUFBUSxFQUNSLFlBQVksR0FJYjs7WUFDQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxZQUFZLENBQUMsT0FBTyxDQUFDO2dCQUM1QyxVQUFVLEVBQUUsWUFBWTtnQkFDeEIsTUFBTSxFQUFFO29CQUNOLEdBQUcsRUFBRSxRQUFRO2lCQUNkO2dCQUNELE9BQU8sRUFBRTtvQkFDUCxVQUFVLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO2lCQUM3QjthQUNGLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1gsTUFBTSxJQUFJLG1DQUFjLENBQ3RCLGtEQUFrRCxRQUFRLENBQUMsV0FBVyxFQUFFLHVCQUF1QixDQUNoRyxDQUFDO2FBQ0g7UUFDSCxDQUFDO0tBQUE7Q0FDRixDQUFDLEVBQUUsQ0FBQyJ9