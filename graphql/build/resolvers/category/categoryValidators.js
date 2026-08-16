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
            const categoryDoc = yield accountingDb.findOne({
                collection: "categories",
                filter: {
                    _id: category,
                },
                options: {
                    projection: { _id: true, allowStandalone: true },
                },
            });
            if (categoryDoc === null || categoryDoc === void 0 ? void 0 : categoryDoc.allowStandalone) {
                return;
            }
            const children = yield accountingDb.find({
                collection: "categories",
                filter: {
                    parent: category,
                },
                options: {
                    projection: { _id: true },
                },
            });
            if (children.length > 0) {
                throw new apollo_server_core_1.UserInputError(`Group category is not permitted. "Category" id "${category.toHexString()}" has ${children.length} child categories. Please select a specific subcategory.`);
            }
        });
    }
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2F0ZWdvcnlWYWxpZGF0b3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9jYXRlZ29yeS9jYXRlZ29yeVZhbGlkYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkRBQW9EO0FBS3ZDLFFBQUEsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0lBQzdCLE1BQU0sQ0FBQyxFQUNYLFFBQVEsRUFDUixZQUFZLEdBSWI7O1lBQ0MsSUFDRSxDQUFDLENBQUMsTUFBTSxZQUFZLENBQUMsT0FBTyxDQUFDO2dCQUMzQixVQUFVLEVBQUUsWUFBWTtnQkFDeEIsTUFBTSxFQUFFO29CQUNOLEdBQUcsRUFBRSxRQUFRO2lCQUNkO2dCQUNELE9BQU8sRUFBRTtvQkFDUCxVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO2lCQUMxQjthQUNGLENBQUMsQ0FBQyxFQUNIO2dCQUNBLE1BQU0sSUFBSSxtQ0FBYyxDQUN0QixrQkFBa0IsUUFBUSxDQUFDLFdBQVcsRUFBRSxvQkFBb0IsQ0FDN0QsQ0FBQzthQUNIO1FBQ0gsQ0FBQztLQUFBO0lBQ0ssU0FBUyxDQUFDLEVBQ2QsUUFBUSxFQUNSLFlBQVksR0FJYjs7WUFDQyxNQUFNLFdBQVcsR0FBRyxNQUFNLFlBQVksQ0FBQyxPQUFPLENBQUM7Z0JBQzdDLFVBQVUsRUFBRSxZQUFZO2dCQUN4QixNQUFNLEVBQUU7b0JBQ04sR0FBRyxFQUFFLFFBQVE7aUJBQ2Q7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRTtpQkFDakQ7YUFDRixDQUFDLENBQUM7WUFFSCxJQUFJLFdBQVcsYUFBWCxXQUFXLHVCQUFYLFdBQVcsQ0FBRSxlQUFlLEVBQUU7Z0JBQ2hDLE9BQU87YUFDUjtZQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sWUFBWSxDQUFDLElBQUksQ0FBQztnQkFDdkMsVUFBVSxFQUFFLFlBQVk7Z0JBQ3hCLE1BQU0sRUFBRTtvQkFDTixNQUFNLEVBQUUsUUFBUTtpQkFDakI7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7aUJBQzFCO2FBQ0YsQ0FBQyxDQUFDO1lBRUgsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDdkIsTUFBTSxJQUFJLG1DQUFjLENBQ3RCLG1EQUFtRCxRQUFRLENBQUMsV0FBVyxFQUFFLFNBQVMsUUFBUSxDQUFDLE1BQU0sMERBQTBELENBQzVKLENBQUM7YUFDSDtRQUNILENBQUM7S0FBQTtDQUNGLENBQUMsRUFBRSxDQUFDIn0=