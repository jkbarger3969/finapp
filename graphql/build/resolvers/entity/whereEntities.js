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
exports.whereEntities = void 0;
const iterableFns_1 = require("../../utils/iterableFns");
const business_1 = require("../business");
const department_1 = require("../department");
const person_1 = require("../person");
const whereEntities = (entitiesWhere, db) => __awaiter(void 0, void 0, void 0, function* () {
    const whereEntityResults = {};
    const promises = [];
    for (const whereKey of (0, iterableFns_1.iterateOwnKeys)(entitiesWhere)) {
        switch (whereKey) {
            case "businesses":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    const result = (0, business_1.whereBusiness)(entitiesWhere[whereKey]);
                    const query = result instanceof Promise ? yield result : result;
                    const results = (yield db
                        .collection("businesses")
                        .find(query, {
                        projection: {
                            _id: true,
                        },
                    })
                        .toArray()).map(({ _id }) => _id);
                    if (results.length) {
                        whereEntityResults.businesses = results;
                    }
                }))());
                break;
            case "departments":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    const result = (0, department_1.whereDepartments)(entitiesWhere[whereKey], db);
                    const query = result instanceof Promise ? yield result : result;
                    const results = (yield db
                        .collection("departments")
                        .find(query, {
                        projection: {
                            _id: true,
                        },
                    })
                        .toArray()).map(({ _id }) => _id);
                    if (results.length) {
                        whereEntityResults.departments = results;
                    }
                }))());
                break;
            case "people":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    const query = (0, person_1.wherePeople)(entitiesWhere[whereKey]);
                    const results = (yield db
                        .collection("people")
                        .find(query, {
                        projection: {
                            _id: true,
                        },
                    })
                        .toArray()).map(({ _id }) => _id);
                    if (results.length) {
                        whereEntityResults.people = results;
                    }
                }))());
                break;
        }
    }
    yield Promise.all(promises);
    return whereEntityResults;
});
exports.whereEntities = whereEntities;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2hlcmVFbnRpdGllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvZW50aXR5L3doZXJlRW50aXRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBR0EseURBQXlEO0FBQ3pELDBDQUE0QztBQUM1Qyw4Q0FBaUQ7QUFDakQsc0NBQXdDO0FBT2pDLE1BQU0sYUFBYSxHQUFHLENBQzNCLGFBQTRCLEVBQzVCLEVBQU0sRUFDeUIsRUFBRTtJQUNqQyxNQUFNLGtCQUFrQixHQUF5QixFQUFFLENBQUM7SUFFcEQsTUFBTSxRQUFRLEdBQW9CLEVBQUUsQ0FBQztJQUVyQyxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUEsNEJBQWMsRUFBQyxhQUFhLENBQUMsRUFBRTtRQUNwRCxRQUFRLFFBQVEsRUFBRTtZQUNoQixLQUFLLFlBQVk7Z0JBQ2YsUUFBUSxDQUFDLElBQUksQ0FDWCxDQUFDLEdBQVMsRUFBRTtvQkFDVixNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFhLEVBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBRXRELE1BQU0sS0FBSyxHQUFHLE1BQU0sWUFBWSxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7b0JBRWhFLE1BQU0sT0FBTyxHQUFHLENBQ2QsTUFBTSxFQUFFO3lCQUNMLFVBQVUsQ0FFUixZQUFZLENBQUM7eUJBQ2YsSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDWCxVQUFVLEVBQUU7NEJBQ1YsR0FBRyxFQUFFLElBQUk7eUJBQ1Y7cUJBQ0YsQ0FBQzt5QkFDRCxPQUFPLEVBQUUsQ0FDYixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUV4QixJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7d0JBQ2xCLGtCQUFrQixDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7cUJBQ3pDO2dCQUNILENBQUMsQ0FBQSxDQUFDLEVBQUUsQ0FDTCxDQUFDO2dCQUNGLE1BQU07WUFDUixLQUFLLGFBQWE7Z0JBQ2hCLFFBQVEsQ0FBQyxJQUFJLENBQ1gsQ0FBQyxHQUFTLEVBQUU7b0JBQ1YsTUFBTSxNQUFNLEdBQUcsSUFBQSw2QkFBZ0IsRUFBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBRTdELE1BQU0sS0FBSyxHQUFHLE1BQU0sWUFBWSxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7b0JBRWhFLE1BQU0sT0FBTyxHQUFHLENBQ2QsTUFBTSxFQUFFO3lCQUNMLFVBQVUsQ0FFUixhQUFhLENBQUM7eUJBQ2hCLElBQUksQ0FBQyxLQUFLLEVBQUU7d0JBQ1gsVUFBVSxFQUFFOzRCQUNWLEdBQUcsRUFBRSxJQUFJO3lCQUNWO3FCQUNGLENBQUM7eUJBQ0QsT0FBTyxFQUFFLENBQ2IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFFeEIsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO3dCQUNsQixrQkFBa0IsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO3FCQUMxQztnQkFDSCxDQUFDLENBQUEsQ0FBQyxFQUFFLENBQ0wsQ0FBQztnQkFDRixNQUFNO1lBQ1IsS0FBSyxRQUFRO2dCQUNYLFFBQVEsQ0FBQyxJQUFJLENBQ1gsQ0FBQyxHQUFTLEVBQUU7b0JBQ1YsTUFBTSxLQUFLLEdBQUcsSUFBQSxvQkFBVyxFQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUVuRCxNQUFNLE9BQU8sR0FBRyxDQUNkLE1BQU0sRUFBRTt5QkFDTCxVQUFVLENBRVIsUUFBUSxDQUFDO3lCQUNYLElBQUksQ0FBQyxLQUFLLEVBQUU7d0JBQ1gsVUFBVSxFQUFFOzRCQUNWLEdBQUcsRUFBRSxJQUFJO3lCQUNWO3FCQUNGLENBQUM7eUJBQ0QsT0FBTyxFQUFFLENBQ2IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFFeEIsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO3dCQUNsQixrQkFBa0IsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDO3FCQUNyQztnQkFDSCxDQUFDLENBQUEsQ0FBQyxFQUFFLENBQ0wsQ0FBQztnQkFDRixNQUFNO1NBQ1Q7S0FDRjtJQUVELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUU1QixPQUFPLGtCQUFrQixDQUFDO0FBQzVCLENBQUMsQ0FBQSxDQUFDO0FBNUZXLFFBQUEsYUFBYSxpQkE0RnhCIn0=