"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alias = exports.AliasTarget = void 0;
const mongodb_1 = require("mongodb");
const change_case_1 = require("change-case");
const queryUtils_1 = require("../utils/queryUtils");
exports.AliasTarget = {
    // __typename added with addTypename
    __resolveType: ({ __typename }) => __typename,
};
const AliasResolver = {
    id: ({ _id }) => _id.toString(),
    target: ({ target: { type, id } }, _, { db }) => {
        switch (type) {
            case "Category":
                return (0, queryUtils_1.addTypename)(type, db.collection("categories").findOne({ _id: new mongodb_1.ObjectId(id) }));
            case "Department":
                return (0, queryUtils_1.addTypename)(type, db.collection("departments").findOne({ _id: new mongodb_1.ObjectId(id) }));
        }
    },
    type: ({ type }) => (0, change_case_1.snakeCase)(type).toUpperCase(),
};
exports.Alias = AliasResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxpYXNSZXNvbHZlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2FsaWFzL2FsaWFzUmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFtQztBQUNuQyw2Q0FBd0M7QUFReEMsb0RBQWdFO0FBVW5ELFFBQUEsV0FBVyxHQUF5QjtJQUMvQyxvQ0FBb0M7SUFDcEMsYUFBYSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsVUFBVTtDQUN2QyxDQUFDO0FBRVQsTUFBTSxhQUFhLEdBQTJDO0lBQzVELEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7SUFDL0IsTUFBTSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO1FBQzlDLFFBQVEsSUFBSSxFQUFFO1lBQ1osS0FBSyxVQUFVO2dCQUNiLE9BQU8sSUFBQSx3QkFBVyxFQUNoQixJQUFJLEVBQ0osRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FDL0QsQ0FBQztZQUNKLEtBQUssWUFBWTtnQkFDZixPQUFPLElBQUEsd0JBQVcsRUFDaEIsSUFBSSxFQUNKLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQ2hFLENBQUM7U0FDTDtJQUNILENBQUM7SUFDRCxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFBLHVCQUFTLEVBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFlO0NBQy9ELENBQUM7QUFFVyxRQUFBLEtBQUssR0FBRyxhQUEwQyxDQUFDIn0=