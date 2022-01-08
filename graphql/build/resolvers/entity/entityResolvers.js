"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = exports.getEntities = exports.getEntity = void 0;
const queryUtils_1 = require("../utils/queryUtils");
const getEntity = (node, db) => {
    const { type, id } = node;
    switch (type) {
        case "Business":
            return (0, queryUtils_1.addTypename)(type, db.collection("businesses").findOne({ _id: id }));
        case "Department":
            return (0, queryUtils_1.addTypename)(type, db.collection("departments").findOne({ _id: id }));
        case "Person":
            return (0, queryUtils_1.addTypename)(type, db.collection("people").findOne({ _id: id }));
    }
};
exports.getEntity = getEntity;
const getEntities = (nodes, db) => Promise.all(nodes.map((node) => (0, exports.getEntity)(node, db)));
exports.getEntities = getEntities;
const EntityResolver = {
    __resolveType: ({ __typename }) => __typename,
};
exports.Entity = EntityResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXR5UmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9lbnRpdHkvZW50aXR5UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVlBLG9EQUFnRTtBQU16RCxNQUFNLFNBQVMsR0FBRyxDQUFDLElBQW9CLEVBQUUsRUFBTSxFQUFFLEVBQUU7SUFDeEQsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFFMUIsUUFBUSxJQUFJLEVBQUU7UUFDWixLQUFLLFVBQVU7WUFDYixPQUFPLElBQUEsd0JBQVcsRUFDaEIsSUFBSSxFQUNKLEVBQUUsQ0FBQyxVQUFVLENBQW1CLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUNuRSxDQUFDO1FBQ0osS0FBSyxZQUFZO1lBQ2YsT0FBTyxJQUFBLHdCQUFXLEVBQ2hCLElBQUksRUFDSixFQUFFLENBQUMsVUFBVSxDQUFxQixhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FDdEUsQ0FBQztRQUNKLEtBQUssUUFBUTtZQUNYLE9BQU8sSUFBQSx3QkFBVyxFQUNoQixJQUFJLEVBQ0osRUFBRSxDQUFDLFVBQVUsQ0FBaUIsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQzdELENBQUM7S0FDTDtBQUNILENBQUMsQ0FBQztBQXBCVyxRQUFBLFNBQVMsYUFvQnBCO0FBRUssTUFBTSxXQUFXLEdBQUcsQ0FBQyxLQUF1QixFQUFFLEVBQU0sRUFBRSxFQUFFLENBQzdELE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBQSxpQkFBUyxFQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFEM0MsUUFBQSxXQUFXLGVBQ2dDO0FBRXhELE1BQU0sY0FBYyxHQUF5QztJQUMzRCxhQUFhLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxVQUFVO0NBQzlDLENBQUM7QUFDVyxRQUFBLE1BQU0sR0FBRyxjQUE0QyxDQUFDIn0=