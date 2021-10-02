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
exports.upsertEntrySourceToEntityDbRecord = void 0;
const mongodb_1 = require("mongodb");
const graphTypes_1 = require("../../graphTypes");
const business_1 = require("../business");
const addNewPerson_1 = require("../person/addNewPerson");
const person_1 = require("../person");
/**
 * Parses {@link UpsertEntrySource} and creates records.
 */
const upsertEntrySourceToEntityDbRecord = ({ upsertEntrySourceInput, accountingDb, }) => __awaiter(void 0, void 0, void 0, function* () {
    return accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
        const [name] = Object.keys(upsertEntrySourceInput);
        switch (name) {
            case "person": {
                const newPerson = upsertEntrySourceInput[name];
                person_1.validatePerson.newPerson({ newPerson });
                const { insertedId } = yield (0, addNewPerson_1.addNewPersonRecord)({
                    newPerson,
                    accountingDb,
                });
                return {
                    type: "Person",
                    id: insertedId,
                };
            }
            case "business": {
                const newBusiness = upsertEntrySourceInput[name];
                business_1.validateBusiness.newBusiness({
                    newBusiness,
                });
                const { insertedId } = yield (0, business_1.addNewBusinessRecord)({
                    newBusiness,
                    accountingDb,
                });
                return {
                    type: "Business",
                    id: insertedId,
                };
            }
            case "source": {
                const source = upsertEntrySourceInput[name];
                const id = new mongodb_1.ObjectId(source.id);
                switch (source.type) {
                    case graphTypes_1.EntityType.Business:
                        return {
                            type: "Business",
                            id,
                        };
                    case graphTypes_1.EntityType.Department:
                        return {
                            type: "Department",
                            id,
                        };
                    case graphTypes_1.EntityType.Person:
                        return {
                            type: "Person",
                            id,
                        };
                }
            }
        }
    }));
});
exports.upsertEntrySourceToEntityDbRecord = upsertEntrySourceToEntityDbRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBzZXJ0RW50cnlTb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L3Vwc2VydEVudHJ5U291cmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUduQyxpREFBaUU7QUFDakUsMENBQXFFO0FBQ3JFLHlEQUE0RDtBQUM1RCxzQ0FBMkM7QUFFM0M7O0dBRUc7QUFDSSxNQUFNLGlDQUFpQyxHQUFHLENBQU8sRUFDdEQsc0JBQXNCLEVBQ3RCLFlBQVksR0FJYixFQUEyQixFQUFFO0lBQzVCLE9BQUEsWUFBWSxDQUFDLGVBQWUsQ0FBQyxHQUFTLEVBQUU7UUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBRWhELENBQUM7UUFFRixRQUFRLElBQUksRUFBRTtZQUNaLEtBQUssUUFBUSxDQUFDLENBQUM7Z0JBQ2IsTUFBTSxTQUFTLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRS9DLHVCQUFjLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztnQkFFeEMsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLE1BQU0sSUFBQSxpQ0FBa0IsRUFBQztvQkFDOUMsU0FBUztvQkFDVCxZQUFZO2lCQUNiLENBQUMsQ0FBQztnQkFFSCxPQUFPO29CQUNMLElBQUksRUFBRSxRQUFRO29CQUNkLEVBQUUsRUFBRSxVQUFVO2lCQUNmLENBQUM7YUFDSDtZQUVELEtBQUssVUFBVSxDQUFDLENBQUM7Z0JBQ2YsTUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRWpELDJCQUFnQixDQUFDLFdBQVcsQ0FBQztvQkFDM0IsV0FBVztpQkFDWixDQUFDLENBQUM7Z0JBRUgsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLE1BQU0sSUFBQSwrQkFBb0IsRUFBQztvQkFDaEQsV0FBVztvQkFDWCxZQUFZO2lCQUNiLENBQUMsQ0FBQztnQkFFSCxPQUFPO29CQUNMLElBQUksRUFBRSxVQUFVO29CQUNoQixFQUFFLEVBQUUsVUFBVTtpQkFDZixDQUFDO2FBQ0g7WUFFRCxLQUFLLFFBQVEsQ0FBQyxDQUFDO2dCQUNiLE1BQU0sTUFBTSxHQUFHLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUU1QyxNQUFNLEVBQUUsR0FBRyxJQUFJLGtCQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUVuQyxRQUFRLE1BQU0sQ0FBQyxJQUFJLEVBQUU7b0JBQ25CLEtBQUssdUJBQVUsQ0FBQyxRQUFRO3dCQUN0QixPQUFPOzRCQUNMLElBQUksRUFBRSxVQUFVOzRCQUNoQixFQUFFO3lCQUNILENBQUM7b0JBQ0osS0FBSyx1QkFBVSxDQUFDLFVBQVU7d0JBQ3hCLE9BQU87NEJBQ0wsSUFBSSxFQUFFLFlBQVk7NEJBQ2xCLEVBQUU7eUJBQ0gsQ0FBQztvQkFDSixLQUFLLHVCQUFVLENBQUMsTUFBTTt3QkFDcEIsT0FBTzs0QkFDTCxJQUFJLEVBQUUsUUFBUTs0QkFDZCxFQUFFO3lCQUNILENBQUM7aUJBQ0w7YUFDRjtTQUNGO0lBQ0gsQ0FBQyxDQUFBLENBQUMsQ0FBQTtFQUFBLENBQUM7QUF2RVEsUUFBQSxpQ0FBaUMscUNBdUV6QyJ9