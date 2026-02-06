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
    __isTypeOf: (obj) => !("parent" in obj),
    id: ({ _id }) => _id.toString(),
    budgets,
    departments,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVzaW5lc3NSZXNvbHZlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2J1c2luZXNzL0J1c2luZXNzUmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUdBLE1BQU0sT0FBTyxHQUFpQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtJQUNuRSxPQUFPLEVBQUU7U0FDTixVQUFVLENBQUMsU0FBUyxDQUFDO1NBQ3JCLElBQUksQ0FBQztRQUNKLFlBQVksRUFBRSxVQUFVO1FBQ3hCLFVBQVUsRUFBRSxHQUFHO0tBQ2hCLENBQUM7U0FDRCxPQUFPLEVBQVMsQ0FBQztBQUN0QixDQUFDLENBQUM7QUFFRixNQUFNLFdBQVcsR0FBcUMsQ0FDcEQsRUFBRSxHQUFHLEVBQUUsRUFDUCxFQUFFLElBQUksRUFBRSxFQUNSLEVBQUUsRUFBRSxFQUFFLEVBQ04sRUFBRTtJQUNGLE1BQU0sT0FBTyxHQUF5QixFQUFFLENBQUM7SUFFekMsTUFBTSxLQUFLLEdBQUcsTUFBTSxFQUFFO1NBQ25CLFVBQVUsQ0FBcUIsYUFBYSxDQUFDO1NBQzdDLElBQUksQ0FBQztRQUNKLGFBQWEsRUFBRSxVQUFVO1FBQ3pCLFdBQVcsRUFBRSxHQUFHO0tBQ2pCLENBQUM7U0FDRCxPQUFPLEVBQUUsQ0FBQztJQUViLElBQUksSUFBSSxFQUFFO1FBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0tBQ3hCO1NBQU07UUFDTCxPQUFPLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO1lBRXZCLEtBQUssQ0FBQyxJQUFJLENBQ1IsR0FBRyxDQUFDLE1BQU0sRUFBRTtpQkFDVCxVQUFVLENBQXFCLGFBQWEsQ0FBQztpQkFDN0MsSUFBSSxDQUFDO2dCQUNKLGFBQWEsRUFBRSxZQUFZO2dCQUMzQixXQUFXLEVBQUU7b0JBQ1gsR0FBRyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO2lCQUMzQzthQUNGLENBQUM7aUJBQ0QsT0FBTyxFQUFFLENBQUMsQ0FDZCxDQUFDO1NBQ0g7S0FDRjtJQUVELE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUMsQ0FBQSxDQUFDO0FBRVcsUUFBQSxRQUFRLEdBQXNCO0lBQ3pDLFVBQVUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUM7SUFDdkMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTtJQUMvQixPQUFPO0lBQ1AsV0FBVztDQUNILENBQUMifQ==