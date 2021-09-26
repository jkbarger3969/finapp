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
exports.Business = void 0;
const budgets = ({ _id }, _, { db }) => {
    return db
        .collection("budgets")
        .find({
        "owner.type": "Business",
        "owner.id": _id,
    })
        .toArray();
};
const departments = ({ _id }, { root }, { db }) => __awaiter(void 0, void 0, void 0, function* () {
    const results = [];
    const query = yield db
        .collection("departments")
        .find({
        "parent.type": "Business",
        "parent.id": _id,
    })
        .toArray();
    if (root) {
        results.push(...query);
    }
    else {
        while (query.length) {
            results.push(...query);
            query.push(...(yield db
                .collection("departments")
                .find({
                "parent.type": "Department",
                "parent.id": {
                    $in: query.splice(0).map(({ _id }) => _id),
                },
            })
                .toArray()));
        }
    }
    return results;
});
exports.Business = {
    id: ({ _id }) => _id.toString(),
    budgets,
    departments,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVzaW5lc3NSZXNvbHZlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2J1c2luZXNzL0J1c2luZXNzUmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUdBLE1BQU0sT0FBTyxHQUFpQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtJQUNuRSxPQUFPLEVBQUU7U0FDTixVQUFVLENBQUMsU0FBUyxDQUFDO1NBQ3JCLElBQUksQ0FBQztRQUNKLFlBQVksRUFBRSxVQUFVO1FBQ3hCLFVBQVUsRUFBRSxHQUFHO0tBQ2hCLENBQUM7U0FDRCxPQUFPLEVBQUUsQ0FBQztBQUNmLENBQUMsQ0FBQztBQUVGLE1BQU0sV0FBVyxHQUFxQyxDQUNwRCxFQUFFLEdBQUcsRUFBRSxFQUNQLEVBQUUsSUFBSSxFQUFFLEVBQ1IsRUFBRSxFQUFFLEVBQUUsRUFDTixFQUFFO0lBQ0YsTUFBTSxPQUFPLEdBQXlCLEVBQUUsQ0FBQztJQUV6QyxNQUFNLEtBQUssR0FBRyxNQUFNLEVBQUU7U0FDbkIsVUFBVSxDQUFxQixhQUFhLENBQUM7U0FDN0MsSUFBSSxDQUFDO1FBQ0osYUFBYSxFQUFFLFVBQVU7UUFDekIsV0FBVyxFQUFFLEdBQUc7S0FDakIsQ0FBQztTQUNELE9BQU8sRUFBRSxDQUFDO0lBRWIsSUFBSSxJQUFJLEVBQUU7UUFDUixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7S0FDeEI7U0FBTTtRQUNMLE9BQU8sS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFFdkIsS0FBSyxDQUFDLElBQUksQ0FDUixHQUFHLENBQUMsTUFBTSxFQUFFO2lCQUNULFVBQVUsQ0FBcUIsYUFBYSxDQUFDO2lCQUM3QyxJQUFJLENBQUM7Z0JBQ0osYUFBYSxFQUFFLFlBQVk7Z0JBQzNCLFdBQVcsRUFBRTtvQkFDWCxHQUFHLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7aUJBQzNDO2FBQ0YsQ0FBQztpQkFDRCxPQUFPLEVBQUUsQ0FBQyxDQUNkLENBQUM7U0FDSDtLQUNGO0lBRUQsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQyxDQUFBLENBQUM7QUFFVyxRQUFBLFFBQVEsR0FBc0I7SUFDekMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTtJQUMvQixPQUFPO0lBQ1AsV0FBVztDQUNILENBQUMifQ==