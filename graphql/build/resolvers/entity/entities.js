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
const entities = (_, { where }, { db }) => __awaiter(void 0, void 0, void 0, function* () {
    const results = [];
    const promises = [];
    for (const whereKey of (0, iterableFns_1.iterateOwnKeys)(where)) {
        switch (whereKey) {
            case "businesses":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    results.push(...(yield (0, queryUtils_1.addTypename)("Business", db
                        .collection("businesses")
                        .find((0, business_1.whereBusiness)(where[whereKey]))
                        .toArray())));
                }))());
                break;
            case "departments":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    results.push(...(yield (0, queryUtils_1.addTypename)("Department", db
                        .collection("departments")
                        .find(yield (0, department_1.whereDepartments)(where[whereKey], db))
                        .toArray())));
                }))());
                break;
            case "people":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    results.push(...(yield (0, queryUtils_1.addTypename)("Person", db
                        .collection("people")
                        .find((0, person_1.wherePeople)(where[whereKey]))
                        .toArray())));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXRpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudGl0eS9lbnRpdGllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwrREFBc0Q7QUFHdEQseURBQXlEO0FBQ3pELDBDQUE0QztBQUM1Qyw4Q0FBaUQ7QUFDakQsc0NBQXdDO0FBQ3hDLG9EQUFrRDtBQUUzQyxNQUFNLFFBQVEsR0FBK0IsQ0FDbEQsQ0FBQyxFQUNELEVBQUUsS0FBSyxFQUFFLEVBQ1QsRUFBRSxFQUFFLEVBQUUsRUFDTixFQUFFO0lBQ0YsTUFBTSxPQUFPLEdBQVUsRUFBRSxDQUFDO0lBRTFCLE1BQU0sUUFBUSxHQUFvQixFQUFFLENBQUM7SUFFckMsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFBLDRCQUFjLEVBQUMsS0FBSyxDQUFDLEVBQUU7UUFDNUMsUUFBUSxRQUFRLEVBQUU7WUFDaEIsS0FBSyxZQUFZO2dCQUNmLFFBQVEsQ0FBQyxJQUFJLENBQ1gsQ0FBQyxHQUFTLEVBQUU7b0JBQ1YsT0FBTyxDQUFDLElBQUksQ0FDVixHQUFHLENBQUMsTUFBTSxJQUFBLHdCQUFXLEVBQ25CLFVBQVUsRUFDVixFQUFFO3lCQUNDLFVBQVUsQ0FBQyxZQUFZLENBQUM7eUJBQ3hCLElBQUksQ0FBQyxJQUFBLHdCQUFhLEVBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7eUJBQ3BDLE9BQU8sRUFBRSxDQUNiLENBQUMsQ0FDSCxDQUFDO2dCQUNKLENBQUMsQ0FBQSxDQUFDLEVBQUUsQ0FDTCxDQUFDO2dCQUNGLE1BQU07WUFDUixLQUFLLGFBQWE7Z0JBQ2hCLFFBQVEsQ0FBQyxJQUFJLENBQ1gsQ0FBQyxHQUFTLEVBQUU7b0JBQ1YsT0FBTyxDQUFDLElBQUksQ0FDVixHQUFHLENBQUMsTUFBTSxJQUFBLHdCQUFXLEVBQ25CLFlBQVksRUFDWixFQUFFO3lCQUNDLFVBQVUsQ0FBQyxhQUFhLENBQUM7eUJBQ3pCLElBQUksQ0FBQyxNQUFNLElBQUEsNkJBQWdCLEVBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO3lCQUNqRCxPQUFPLEVBQUUsQ0FDYixDQUFDLENBQ0gsQ0FBQztnQkFDSixDQUFDLENBQUEsQ0FBQyxFQUFFLENBQ0wsQ0FBQztnQkFDRixNQUFNO1lBQ1IsS0FBSyxRQUFRO2dCQUNYLFFBQVEsQ0FBQyxJQUFJLENBQ1gsQ0FBQyxHQUFTLEVBQUU7b0JBQ1YsT0FBTyxDQUFDLElBQUksQ0FDVixHQUFHLENBQUMsTUFBTSxJQUFBLHdCQUFXLEVBQ25CLFFBQVEsRUFDUixFQUFFO3lCQUNDLFVBQVUsQ0FBQyxRQUFRLENBQUM7eUJBQ3BCLElBQUksQ0FBQyxJQUFBLG9CQUFXLEVBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7eUJBQ2xDLE9BQU8sRUFBRSxDQUNiLENBQUMsQ0FDSCxDQUFDO2dCQUNKLENBQUMsQ0FBQSxDQUFDLEVBQUUsQ0FDTCxDQUFDO2dCQUVGLE1BQU07U0FDVDtLQUNGO0lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7UUFDcEIsTUFBTSxJQUFJLHFDQUFjLENBQ3RCLG9FQUFvRSxFQUNwRTtZQUNFLFlBQVksRUFBRSxPQUFPO1NBQ3RCLENBQ0YsQ0FBQztLQUNIO0lBRUQsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTVCLE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUMsQ0FBQSxDQUFDO0FBeEVXLFFBQUEsUUFBUSxZQXdFbkIifQ==