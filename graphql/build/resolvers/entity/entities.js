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
exports.entities = void 0;
const apollo_server_errors_1 = require("apollo-server-errors");
const iterableFns_1 = require("../../utils/iterableFns");
const business_1 = require("../business");
const department_1 = require("../department");
const person_1 = require("../person");
const queryUtils_1 = require("../utils/queryUtils");
const entities = (_, { where }, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
    const results = [];
    const promises = [];
    for (const whereKey of (0, iterableFns_1.iterateOwnKeys)(where)) {
        switch (whereKey) {
            case "businesses":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    results.push(...(yield (0, queryUtils_1.addTypename)("Business", accountingDb.find({
                        collection: "businesses",
                        filter: (0, business_1.whereBusiness)(where[whereKey]),
                    }))));
                }))());
                break;
            case "departments":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    results.push(...(yield (0, queryUtils_1.addTypename)("Department", accountingDb.find({
                        collection: "departments",
                        filter: yield (0, department_1.whereDepartments)(where[whereKey], accountingDb.db),
                    }))));
                }))());
                break;
            case "people":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    results.push(...(yield (0, queryUtils_1.addTypename)("Person", accountingDb.find({
                        collection: "people",
                        filter: (0, person_1.wherePeople)(where[whereKey]),
                    }))));
                }))());
                break;
        }
    }
    if (!promises.length) {
        throw new apollo_server_errors_1.UserInputError("At least where businesses, departments, or people filter required.", {
            argumentName: "where",
        });
    }
    yield Promise.all(promises);
    return results;
});
exports.entities = entities;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXRpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudGl0eS9lbnRpdGllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwrREFBc0Q7QUFHdEQseURBQXlEO0FBQ3pELDBDQUE0QztBQUM1Qyw4Q0FBaUQ7QUFDakQsc0NBQXdDO0FBQ3hDLG9EQUFrRDtBQUUzQyxNQUFNLFFBQVEsR0FBK0IsQ0FDbEQsQ0FBQyxFQUNELEVBQUUsS0FBSyxFQUFFLEVBQ1QsRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUNqQyxFQUFFO0lBQ0YsTUFBTSxPQUFPLEdBQVUsRUFBRSxDQUFDO0lBRTFCLE1BQU0sUUFBUSxHQUFvQixFQUFFLENBQUM7SUFFckMsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFBLDRCQUFjLEVBQUMsS0FBSyxDQUFDLEVBQUU7UUFDNUMsUUFBUSxRQUFRLEVBQUU7WUFDaEIsS0FBSyxZQUFZO2dCQUNmLFFBQVEsQ0FBQyxJQUFJLENBQ1gsQ0FBQyxHQUFTLEVBQUU7b0JBQ1YsT0FBTyxDQUFDLElBQUksQ0FDVixHQUFHLENBQUMsTUFBTSxJQUFBLHdCQUFXLEVBQ25CLFVBQVUsRUFDVixZQUFZLENBQUMsSUFBSSxDQUFDO3dCQUNoQixVQUFVLEVBQUUsWUFBWTt3QkFDeEIsTUFBTSxFQUFFLElBQUEsd0JBQWEsRUFBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7cUJBQ3ZDLENBQUMsQ0FDSCxDQUFDLENBQ0gsQ0FBQztnQkFDSixDQUFDLENBQUEsQ0FBQyxFQUFFLENBQ0wsQ0FBQztnQkFDRixNQUFNO1lBQ1IsS0FBSyxhQUFhO2dCQUNoQixRQUFRLENBQUMsSUFBSSxDQUNYLENBQUMsR0FBUyxFQUFFO29CQUNWLE9BQU8sQ0FBQyxJQUFJLENBQ1YsR0FBRyxDQUFDLE1BQU0sSUFBQSx3QkFBVyxFQUNuQixZQUFZLEVBQ1osWUFBWSxDQUFDLElBQUksQ0FBQzt3QkFDaEIsVUFBVSxFQUFFLGFBQWE7d0JBQ3pCLE1BQU0sRUFBRSxNQUFNLElBQUEsNkJBQWdCLEVBQzVCLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFDZixZQUFZLENBQUMsRUFBRSxDQUNoQjtxQkFDRixDQUFDLENBQ0gsQ0FBQyxDQUNILENBQUM7Z0JBQ0osQ0FBQyxDQUFBLENBQUMsRUFBRSxDQUNMLENBQUM7Z0JBQ0YsTUFBTTtZQUNSLEtBQUssUUFBUTtnQkFDWCxRQUFRLENBQUMsSUFBSSxDQUNYLENBQUMsR0FBUyxFQUFFO29CQUNWLE9BQU8sQ0FBQyxJQUFJLENBQ1YsR0FBRyxDQUFDLE1BQU0sSUFBQSx3QkFBVyxFQUNuQixRQUFRLEVBQ1IsWUFBWSxDQUFDLElBQUksQ0FBQzt3QkFDaEIsVUFBVSxFQUFFLFFBQVE7d0JBQ3BCLE1BQU0sRUFBRSxJQUFBLG9CQUFXLEVBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUNyQyxDQUFDLENBQ0gsQ0FBQyxDQUNILENBQUM7Z0JBQ0osQ0FBQyxDQUFBLENBQUMsRUFBRSxDQUNMLENBQUM7Z0JBRUYsTUFBTTtTQUNUO0tBQ0Y7SUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtRQUNwQixNQUFNLElBQUkscUNBQWMsQ0FDdEIsb0VBQW9FLEVBQ3BFO1lBQ0UsWUFBWSxFQUFFLE9BQU87U0FDdEIsQ0FDRixDQUFDO0tBQ0g7SUFFRCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFNUIsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQyxDQUFBLENBQUM7QUEzRVcsUUFBQSxRQUFRLFlBMkVuQiJ9