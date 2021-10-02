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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXR5UmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9lbnRpdHkvZW50aXR5UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUdBLG9EQUFnRTtBQU16RCxNQUFNLFNBQVMsR0FBRyxDQUFDLElBQW9CLEVBQUUsRUFBTSxFQUFFLEVBQUU7SUFDeEQsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFFMUIsUUFBUSxJQUFJLEVBQUU7UUFDWixLQUFLLFVBQVU7WUFDYixPQUFPLElBQUEsd0JBQVcsRUFDaEIsSUFBSSxFQUNKLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQ2pELENBQUM7UUFDSixLQUFLLFlBQVk7WUFDZixPQUFPLElBQUEsd0JBQVcsRUFDaEIsSUFBSSxFQUNKLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQ2xELENBQUM7UUFDSixLQUFLLFFBQVE7WUFDWCxPQUFPLElBQUEsd0JBQVcsRUFBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzFFO0FBQ0gsQ0FBQyxDQUFDO0FBakJXLFFBQUEsU0FBUyxhQWlCcEI7QUFFSyxNQUFNLFdBQVcsR0FBRyxDQUFDLEtBQXVCLEVBQUUsRUFBTSxFQUFFLEVBQUUsQ0FDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFBLGlCQUFTLEVBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUQzQyxRQUFBLFdBQVcsZUFDZ0M7QUFFeEQsTUFBTSxjQUFjLEdBQXlDO0lBQzNELGFBQWEsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxDQUFDLFVBQVU7Q0FDOUMsQ0FBQztBQUNXLFFBQUEsTUFBTSxHQUFHLGNBQTRDLENBQUMifQ==