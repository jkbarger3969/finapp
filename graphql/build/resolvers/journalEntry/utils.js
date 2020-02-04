"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const addFields = { $addFields: {
        id: { $toString: "$_id" },
        type: { $arrayElemAt: ["$type.value", 0] },
        department: { $arrayElemAt: ["$department.value", 0] },
        category: { $arrayElemAt: ["$category.value", 0] },
        paymentMethod: { $arrayElemAt: ["$paymentMethod.value", 0] },
        total: { $arrayElemAt: ["$total.value", 0] },
        source: { $arrayElemAt: ["$source.value", 0] },
        reconciled: { $arrayElemAt: ["$reconciled.value", 0] },
        description: { $ifNull: [{ $arrayElemAt: ["$description.value", 0] }, null] },
        date: { $arrayElemAt: ["$date.value", 0] },
        deleted: { $arrayElemAt: ["$deleted.value", 0] }
    } };
exports.addFields = addFields;
const project = { $project: {
        parent: false,
        createdBy: false
    } };
exports.project = project;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeS91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLE1BQU0sU0FBUyxHQUFHLEVBQUMsVUFBVSxFQUFDO1FBQzVCLEVBQUUsRUFBQyxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUM7UUFDdEIsSUFBSSxFQUFDLEVBQUMsWUFBWSxFQUFFLENBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDO1FBQ3RDLFVBQVUsRUFBQyxFQUFDLFlBQVksRUFBRSxDQUFDLG1CQUFtQixFQUFDLENBQUMsQ0FBQyxFQUFDO1FBQ2xELFFBQVEsRUFBQyxFQUFDLFlBQVksRUFBRSxDQUFDLGlCQUFpQixFQUFDLENBQUMsQ0FBQyxFQUFDO1FBQzlDLGFBQWEsRUFBQyxFQUFDLFlBQVksRUFBRSxDQUFDLHNCQUFzQixFQUFDLENBQUMsQ0FBQyxFQUFDO1FBQ3hELEtBQUssRUFBQyxFQUFDLFlBQVksRUFBRSxDQUFDLGNBQWMsRUFBQyxDQUFDLENBQUMsRUFBQztRQUN4QyxNQUFNLEVBQUMsRUFBQyxZQUFZLEVBQUUsQ0FBQyxlQUFlLEVBQUMsQ0FBQyxDQUFDLEVBQUM7UUFDMUMsVUFBVSxFQUFDLEVBQUMsWUFBWSxFQUFFLENBQUMsbUJBQW1CLEVBQUMsQ0FBQyxDQUFDLEVBQUM7UUFDbEQsV0FBVyxFQUFDLEVBQUMsT0FBTyxFQUFFLENBQUUsRUFBQyxZQUFZLEVBQUUsQ0FBQyxvQkFBb0IsRUFBQyxDQUFDLENBQUMsRUFBQyxFQUFFLElBQUksQ0FBRSxFQUFDO1FBQ3pFLElBQUksRUFBQyxFQUFDLFlBQVksRUFBRSxDQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQztRQUN0QyxPQUFPLEVBQUMsRUFBQyxZQUFZLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBQyxDQUFDLENBQUMsRUFBQztLQUM3QyxFQUFDLENBQUM7QUFVSyw4QkFBUztBQVBqQixNQUFNLE9BQU8sR0FBRyxFQUFDLFFBQVEsRUFBRTtRQUN6QixNQUFNLEVBQUMsS0FBSztRQUNaLFNBQVMsRUFBQyxLQUFLO0tBQ2hCLEVBQUMsQ0FBQztBQUlnQiwwQkFBTyJ9