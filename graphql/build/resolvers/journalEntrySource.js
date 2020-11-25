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
exports.journalEntrySources = void 0;
const journalEntrySources = function (parent, args, context, info) {
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
exports.journalEntrySources = journalEntrySources;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5U291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnlTb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBRU8sTUFBTSxtQkFBbUIsR0FDOUIsVUFBZSxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJOztRQUUxQyxNQUFNLEVBQUMsRUFBRSxFQUFDLEdBQUcsT0FBTyxDQUFDO1FBQ3JCLE1BQU0sRUFBQyxZQUFZLEVBQUMsR0FBRyxJQUFJLENBQUM7UUFFNUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRTdDLE1BQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ3RELEVBQUMsTUFBTSxFQUFDLEVBQUMsR0FBRyxFQUFFLENBQUMsRUFBQyxZQUFZLEVBQUMsTUFBTSxFQUFDLEVBQUMsRUFBQyxXQUFXLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxFQUFDO1lBQzVELEVBQUMsVUFBVSxFQUFDO29CQUNWLEVBQUUsRUFBQyxFQUFDLFNBQVMsRUFBQyxNQUFNLEVBQUM7b0JBQ3JCLFVBQVUsRUFBQyxRQUFRO2lCQUNwQixFQUFDO1NBQ0gsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWIsTUFBTSxlQUFlLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDNUQsRUFBQyxNQUFNLEVBQUMsRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFDLEVBQUM7WUFDdEIsRUFBQyxVQUFVLEVBQUM7b0JBQ1YsRUFBRSxFQUFDLEVBQUMsU0FBUyxFQUFDLE1BQU0sRUFBQztvQkFDckIsVUFBVSxFQUFDLFVBQVU7aUJBQ3RCLEVBQUM7U0FDSCxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFYixNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUN6RCxFQUFDLE1BQU0sRUFBQyxFQUFDLElBQUksRUFBQyxNQUFNLEVBQUMsRUFBQztZQUN0QixFQUFDLFVBQVUsRUFBQztvQkFDVixFQUFFLEVBQUMsRUFBQyxTQUFTLEVBQUMsTUFBTSxFQUFDO29CQUNyQixVQUFVLEVBQUMsWUFBWTtpQkFDeEIsRUFBQztTQUNILENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUViLE1BQU0sT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGFBQWEsRUFBRSxlQUFlO1lBQy9ELFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFaEIsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBQyxFQUFFO1lBQ3ZDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztZQUN4QixPQUFPLE9BQU8sQ0FBQztRQUNqQixDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUM7SUFDUixDQUFDO0NBQUEsQ0FBQTtBQXZDWSxRQUFBLG1CQUFtQix1QkF1Qy9CIn0=