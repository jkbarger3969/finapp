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
exports.aggregate = exports.findOne = exports.find = void 0;
const COLLECTION_TYPE_NAMES_MAP = {
    addresses: "Address",
    budgets: "Budget",
    businesses: "Business",
    categories: "Category",
    departments: "Department",
    entries: "Entry",
    fiscalYears: "FiscalYear",
    paymentMethods: "PaymentMethod",
    people: "Person",
    users: "User",
};
/**
 * @returns Mongodb docs with the corresponding GQL __typename based on a
 * mongodb collection to GQL Schema type mapping.
 * */
const find = (db, collection, filter, options) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield db
        .collection(collection)
        .find(filter, options)
        .toArray()).map((doc) => {
        const result = doc;
        result.__typename = COLLECTION_TYPE_NAMES_MAP[collection];
        return result;
    });
});
exports.find = find;
/**
 * @returns Mongodb doc with the corresponding GQL __typename based on a
 * mongodb collection to GQL Schema type mapping.
 * */
const findOne = (db, collection, filter, options) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = (yield db
        .collection(collection)
        .findOne(filter, options));
    doc.__typename = COLLECTION_TYPE_NAMES_MAP[collection];
    return doc;
});
exports.findOne = findOne;
/**
 * @returns Mongodb docs with the corresponding GQL Schema __typename based on a
 * mongodb collection to GQL Schema type mapping.
 * */
const aggregate = (db, collection, pipeline, options) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield db
        .collection(collection)
        .aggregate(pipeline, options)
        .toArray()).map((doc) => {
        doc.__typename = COLLECTION_TYPE_NAMES_MAP[collection];
        return doc;
    });
});
exports.aggregate = aggregate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGJRdWVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvZGJRdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFvQkEsTUFBTSx5QkFBeUIsR0FBa0M7SUFDL0QsU0FBUyxFQUFFLFNBQVM7SUFDcEIsT0FBTyxFQUFFLFFBQVE7SUFDakIsVUFBVSxFQUFFLFVBQVU7SUFDdEIsVUFBVSxFQUFFLFVBQVU7SUFDdEIsV0FBVyxFQUFFLFlBQVk7SUFDekIsT0FBTyxFQUFFLE9BQU87SUFDaEIsV0FBVyxFQUFFLFlBQVk7SUFDekIsY0FBYyxFQUFFLGVBQWU7SUFDL0IsTUFBTSxFQUFFLFFBQVE7SUFDaEIsS0FBSyxFQUFFLE1BQU07Q0FDTCxDQUFDO0FBRVg7OztLQUdLO0FBQ0UsTUFBTSxJQUFJLEdBQUcsQ0FJbEIsRUFBTSxFQUNOLFVBQWEsRUFDYixNQUFpQixFQUNqQixPQUF3QixFQUNpQyxFQUFFO0lBQzNELE9BQU8sQ0FDTCxNQUFNLEVBQUU7U0FDTCxVQUFVLENBQUksVUFBVSxDQUFDO1NBQ3pCLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBa0IsQ0FBQztTQUNoQyxPQUFPLEVBQUUsQ0FDYixDQUFDLEdBQUcsQ0FDSCxDQUFDLEdBQUcsRUFBRSxFQUFFO1FBQ04sTUFBTSxNQUFNLEdBQUcsR0FBNEQsQ0FBQztRQUM1RSxNQUFNLENBQUMsVUFBVSxHQUFHLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUMsQ0FDRixDQUFDO0FBQ0osQ0FBQyxDQUFBLENBQUM7QUFyQlcsUUFBQSxJQUFJLFFBcUJmO0FBRUY7OztLQUdLO0FBQ0UsTUFBTSxPQUFPLEdBQUcsQ0FJckIsRUFBTSxFQUNOLFVBQWEsRUFDYixNQUFpQixFQUNqQixPQUF3QixFQUM2QixFQUFFO0lBQ3ZELE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFO1NBQ2xCLFVBQVUsQ0FBSSxVQUFVLENBQUM7U0FDekIsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFrQixDQUFDLENBRW5DLENBQUM7SUFFSixHQUFHLENBQUMsVUFBVSxHQUFHLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRXZELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyxDQUFBLENBQUM7QUFsQlcsUUFBQSxPQUFPLFdBa0JsQjtBQUVGOzs7S0FHSztBQUNFLE1BQU0sU0FBUyxHQUFHLENBSXZCLEVBQU0sRUFDTixVQUFhLEVBQ2IsUUFBbUMsRUFDbkMsT0FBMEIsRUFDK0IsRUFBRTtJQUMzRCxPQUFPLENBQ0wsTUFBTSxFQUFFO1NBQ0wsVUFBVSxDQUFDLFVBQVUsQ0FBQztTQUN0QixTQUFTLENBQTZDLFFBQVEsRUFBRSxPQUFPLENBQUM7U0FDeEUsT0FBTyxFQUFFLENBQ2IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUNaLEdBQUcsQ0FBQyxVQUFVLEdBQUcseUJBQXlCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdkQsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQSxDQUFDO0FBbEJXLFFBQUEsU0FBUyxhQWtCcEIifQ==