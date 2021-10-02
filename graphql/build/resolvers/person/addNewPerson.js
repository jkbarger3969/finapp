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
exports.addNewPersonRecord = void 0;
const addNewPersonRecord = ({ newPerson, accountingDb, }) => __awaiter(void 0, void 0, void 0, function* () {
    const personRecord = {
        name: {
            first: newPerson.name.first,
            last: newPerson.name.last,
        },
    };
    if (newPerson.email) {
        personRecord.email = newPerson.email;
    }
    if (newPerson.phone) {
        personRecord.phone = newPerson.phone;
    }
    return accountingDb.insertOne({
        collection: "people",
        doc: newPerson,
    });
});
exports.addNewPersonRecord = addNewPersonRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkTmV3UGVyc29uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9wZXJzb24vYWRkTmV3UGVyc29uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUlPLE1BQU0sa0JBQWtCLEdBQUcsQ0FBTyxFQUN2QyxTQUFTLEVBQ1QsWUFBWSxHQUliLEVBQUUsRUFBRTtJQUNILE1BQU0sWUFBWSxHQUFnQztRQUNoRCxJQUFJLEVBQUU7WUFDSixLQUFLLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLO1lBQzNCLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUk7U0FDMUI7S0FDRixDQUFDO0lBRUYsSUFBSSxTQUFTLENBQUMsS0FBSyxFQUFFO1FBQ25CLFlBQVksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztLQUN0QztJQUVELElBQUksU0FBUyxDQUFDLEtBQUssRUFBRTtRQUNuQixZQUFZLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7S0FDdEM7SUFFRCxPQUFPLFlBQVksQ0FBQyxTQUFTLENBQUM7UUFDNUIsVUFBVSxFQUFFLFFBQVE7UUFDcEIsR0FBRyxFQUFFLFNBQVM7S0FDZixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUEsQ0FBQztBQTFCVyxRQUFBLGtCQUFrQixzQkEwQjdCIn0=