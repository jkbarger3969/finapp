"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const graphTypes_1 = require("../../graphTypes");
const DocHistory_1 = require("../utils/DocHistory");
exports.addFields = {
    $addFields: {
        id: { $toString: "$_id" },
        type: { $arrayElemAt: ["$type.value", 0] },
        department: { $arrayElemAt: ["$department.value", 0] },
        category: { $arrayElemAt: ["$category.value", 0] },
        paymentMethod: { $arrayElemAt: ["$paymentMethod.value", 0] },
        total: { $arrayElemAt: ["$total.value", 0] },
        source: { $arrayElemAt: ["$source.value", 0] },
        reconciled: { $arrayElemAt: ["$reconciled.value", 0] },
        description: {
            $ifNull: [{ $arrayElemAt: ["$description.value", 0] }, null]
        },
        date: { $arrayElemAt: ["$date.value", 0] },
        deleted: { $arrayElemAt: ["$deleted.value", 0] }
    }
};
exports.project = {
    $project: {
        parent: false,
        createdBy: false
    }
};
exports.getSrcCollectionAndNode = (db, sourceType, nodeMap) => {
    let collection;
    let id;
    switch (sourceType) {
        case graphTypes_1.JournalEntrySourceType.Business:
            ({ collection, id } = nodeMap.typename.get("Business"));
            break;
        case graphTypes_1.JournalEntrySourceType.Department:
            ({ collection, id } = nodeMap.typename.get("Department"));
            break;
        case graphTypes_1.JournalEntrySourceType.Person:
            ({ collection, id } = nodeMap.typename.get("Person"));
            break;
    }
    return {
        collection: db.collection(collection),
        node: new mongodb_1.ObjectID(id)
    };
};
exports.$addFields = Object.assign(Object.assign({}, DocHistory_1.default.getPresentValues([
    "type",
    "department",
    "category",
    "paymentMethod",
    "total",
    "source",
    "reconciled",
    "description",
    "date",
    "deleted"
])), { id: { $toString: "$_id" } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeS91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHFDQUFtRDtBQUNuRCxpREFBMEQ7QUFFMUQsb0RBQTZDO0FBRWhDLFFBQUEsU0FBUyxHQUFHO0lBQ3ZCLFVBQVUsRUFBRTtRQUNWLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7UUFDekIsSUFBSSxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUFFO1FBQzFDLFVBQVUsRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxFQUFFO1FBQ3RELFFBQVEsRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxFQUFFO1FBQ2xELGFBQWEsRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQyxFQUFFO1FBQzVELEtBQUssRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsRUFBRTtRQUM1QyxNQUFNLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDOUMsVUFBVSxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDdEQsV0FBVyxFQUFFO1lBQ1gsT0FBTyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQztTQUM3RDtRQUNELElBQUksRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsRUFBRTtRQUMxQyxPQUFPLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRTtLQUNqRDtDQUNGLENBQUM7QUFRVyxRQUFBLE9BQU8sR0FBRztJQUNyQixRQUFRLEVBQUU7UUFDUixNQUFNLEVBQUUsS0FBSztRQUNiLFNBQVMsRUFBRSxLQUFLO0tBQ2pCO0NBQ0YsQ0FBQztBQUVXLFFBQUEsdUJBQXVCLEdBQUcsQ0FDckMsRUFBTSxFQUNOLFVBQWtDLEVBQ2xDLE9BQTJCLEVBQ2lCLEVBQUU7SUFDOUMsSUFBSSxVQUFrQixDQUFDO0lBQ3ZCLElBQUksRUFBVSxDQUFDO0lBQ2YsUUFBUSxVQUFVLEVBQUU7UUFDbEIsS0FBSyxtQ0FBc0IsQ0FBQyxRQUFRO1lBQ2xDLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUN4RCxNQUFNO1FBQ1IsS0FBSyxtQ0FBc0IsQ0FBQyxVQUFVO1lBQ3BDLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUMxRCxNQUFNO1FBQ1IsS0FBSyxtQ0FBc0IsQ0FBQyxNQUFNO1lBQ2hDLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN0RCxNQUFNO0tBQ1Q7SUFFRCxPQUFPO1FBQ0wsVUFBVSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDO1FBQ3JDLElBQUksRUFBRSxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDO0tBQ3ZCLENBQUM7QUFDSixDQUFDLENBQUM7QUFFVyxRQUFBLFVBQVUsR0FBRyxnQ0FDckIsb0JBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztJQUM3QixNQUFNO0lBQ04sWUFBWTtJQUNaLFVBQVU7SUFDVixlQUFlO0lBQ2YsT0FBTztJQUNQLFFBQVE7SUFDUixZQUFZO0lBQ1osYUFBYTtJQUNiLE1BQU07SUFDTixTQUFTO0NBQ1YsQ0FBQyxLQUNGLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsR0FDakIsQ0FBQyJ9