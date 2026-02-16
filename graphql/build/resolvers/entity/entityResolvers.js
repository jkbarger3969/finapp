"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = exports.getEntities = exports.getEntity = void 0;
const queryUtils_1 = require("../utils/queryUtils");
const getEntity = (node, db) => {
    if (!node) {
        console.warn("getEntity called with null node");
        return null;
    }
    const { type, id } = node;
    if (!type || !id) {
        console.warn(`getEntity called with invalid node: type=${type}, id=${id}`);
        return null;
    }
    switch (type) {
        case "Business":
            return (0, queryUtils_1.addTypename)(type, db.collection("businesses").findOne({ _id: id }));
        case "Department":
            return (0, queryUtils_1.addTypename)(type, db.collection("departments").findOne({ _id: id }));
        case "Person":
            return (0, queryUtils_1.addTypename)(type, db.collection("people").findOne({ _id: id }));
        default:
            console.warn(`getEntity called with unknown type: ${type}`);
            return null;
    }
};
exports.getEntity = getEntity;
const getEntities = (nodes, db) => Promise.all(nodes.map((node) => (0, exports.getEntity)(node, db)));
exports.getEntities = getEntities;
const EntityResolver = {
    __resolveType: ({ __typename }) => __typename,
};
exports.Entity = EntityResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXR5UmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9lbnRpdHkvZW50aXR5UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVlBLG9EQUFnRTtBQU16RCxNQUFNLFNBQVMsR0FBRyxDQUFDLElBQW9CLEVBQUUsRUFBTSxFQUFFLEVBQUU7SUFDeEQsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNULE9BQU8sQ0FBQyxJQUFJLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUNoRCxPQUFPLElBQUksQ0FBQztLQUNiO0lBQ0QsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFFMUIsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRTtRQUNoQixPQUFPLENBQUMsSUFBSSxDQUFDLDRDQUE0QyxJQUFJLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzRSxPQUFPLElBQUksQ0FBQztLQUNiO0lBRUQsUUFBUSxJQUFJLEVBQUU7UUFDWixLQUFLLFVBQVU7WUFDYixPQUFPLElBQUEsd0JBQVcsRUFDaEIsSUFBSSxFQUNKLEVBQUUsQ0FBQyxVQUFVLENBQW1CLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUNuRSxDQUFDO1FBQ0osS0FBSyxZQUFZO1lBQ2YsT0FBTyxJQUFBLHdCQUFXLEVBQ2hCLElBQUksRUFDSixFQUFFLENBQUMsVUFBVSxDQUFxQixhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FDdEUsQ0FBQztRQUNKLEtBQUssUUFBUTtZQUNYLE9BQU8sSUFBQSx3QkFBVyxFQUNoQixJQUFJLEVBQ0osRUFBRSxDQUFDLFVBQVUsQ0FBaUIsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQzdELENBQUM7UUFDSjtZQUNFLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUNBQXVDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDNUQsT0FBTyxJQUFJLENBQUM7S0FDZjtBQUNILENBQUMsQ0FBQztBQWhDVyxRQUFBLFNBQVMsYUFnQ3BCO0FBRUssTUFBTSxXQUFXLEdBQUcsQ0FBQyxLQUF1QixFQUFFLEVBQU0sRUFBRSxFQUFFLENBQzdELE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBQSxpQkFBUyxFQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFEM0MsUUFBQSxXQUFXLGVBQ2dDO0FBRXhELE1BQU0sY0FBYyxHQUF5QztJQUMzRCxhQUFhLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxVQUFVO0NBQzlDLENBQUM7QUFDVyxRQUFBLE1BQU0sR0FBRyxjQUE0QyxDQUFDIn0=