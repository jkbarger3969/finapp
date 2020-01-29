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
exports.journalEntrySources = function (parent, args, context, info) {
    return __awaiter(this, void 0, void 0, function* () {
        const { db } = context;
        const { searchByName } = args;
        const filter = new RegExp(searchByName, "i");
        const peoplePromise = db.collection("people").aggregate([
            { $match: { $or: [{ "name.first": filter }, { "name.last": filter }] } },
            { $addFields: {
                    id: { $toString: "$_id" },
                    __typename: "Person"
                } }
        ]).toArray();
        const businessPromise = db.collection("businesses").aggregate([
            { $match: { name: filter } },
            { $addFields: {
                    id: { $toString: "$_id" },
                    __typename: "Business"
                } }
        ]).toArray();
        const deptPromise = db.collection("departments").aggregate([
            { $match: { name: filter } },
            { $addFields: {
                    id: { $toString: "$_id" },
                    __typename: "Department"
                } }
        ]).toArray();
        const results = yield Promise.all([peoplePromise, businessPromise,
            deptPromise]);
        return results.reduce((results, result) => {
            results.push(...result);
            return results;
        }, []);
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5U291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnlTb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFFYSxRQUFBLG1CQUFtQixHQUM5QixVQUFlLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUk7O1FBRTFDLE1BQU0sRUFBQyxFQUFFLEVBQUMsR0FBRyxPQUFPLENBQUM7UUFDckIsTUFBTSxFQUFDLFlBQVksRUFBQyxHQUFHLElBQUksQ0FBQztRQUU1QixNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFN0MsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDdEQsRUFBQyxNQUFNLEVBQUMsRUFBQyxHQUFHLEVBQUUsQ0FBQyxFQUFDLFlBQVksRUFBQyxNQUFNLEVBQUMsRUFBQyxFQUFDLFdBQVcsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLEVBQUM7WUFDNUQsRUFBQyxVQUFVLEVBQUM7b0JBQ1YsRUFBRSxFQUFDLEVBQUMsU0FBUyxFQUFDLE1BQU0sRUFBQztvQkFDckIsVUFBVSxFQUFDLFFBQVE7aUJBQ3BCLEVBQUM7U0FDSCxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFYixNQUFNLGVBQWUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUM1RCxFQUFDLE1BQU0sRUFBQyxFQUFDLElBQUksRUFBQyxNQUFNLEVBQUMsRUFBQztZQUN0QixFQUFDLFVBQVUsRUFBQztvQkFDVixFQUFFLEVBQUMsRUFBQyxTQUFTLEVBQUMsTUFBTSxFQUFDO29CQUNyQixVQUFVLEVBQUMsVUFBVTtpQkFDdEIsRUFBQztTQUNILENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUViLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ3pELEVBQUMsTUFBTSxFQUFDLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBQyxFQUFDO1lBQ3RCLEVBQUMsVUFBVSxFQUFDO29CQUNWLEVBQUUsRUFBQyxFQUFDLFNBQVMsRUFBQyxNQUFNLEVBQUM7b0JBQ3JCLFVBQVUsRUFBQyxZQUFZO2lCQUN4QixFQUFDO1NBQ0gsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWIsTUFBTSxPQUFPLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsYUFBYSxFQUFFLGVBQWU7WUFDL0QsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUVoQixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFDLEVBQUU7WUFDdkMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1lBQ3hCLE9BQU8sT0FBTyxDQUFDO1FBQ2pCLENBQUMsRUFBQyxFQUFFLENBQUMsQ0FBQztJQUNSLENBQUM7Q0FBQSxDQUFBIn0=