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
exports.sources = void 0;
const sources = function (parent, args, context, info) {
    return __awaiter(this, void 0, void 0, function* () {
        const { db } = context;
        const { searchByName } = args;
        const filter = new RegExp(searchByName, "i");
        const peoplePromise = db
            .collection("people")
            .aggregate([
            { $match: { $or: [{ "name.first": filter }, { "name.last": filter }] } },
            {
                $addFields: {
                    id: { $toString: "$_id" },
                    __typename: "Person",
                },
            },
        ])
            .toArray();
        const businessPromise = db
            .collection("businesses")
            .aggregate([
            { $match: { name: filter } },
            {
                $addFields: {
                    id: { $toString: "$_id" },
                    __typename: "Business",
                },
            },
        ])
            .toArray();
        const deptPromise = db
            .collection("departments")
            .aggregate([
            { $match: { name: filter } },
            {
                $addFields: {
                    id: { $toString: "$_id" },
                    __typename: "Department",
                },
            },
        ])
            .toArray();
        const results = yield Promise.all([
            peoplePromise,
            businessPromise,
            deptPromise,
        ]);
        return results.reduce((results, result) => {
            results.push(...result);
            return results;
        }, []);
    });
};
exports.sources = sources;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlTb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5U291cmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUVPLE1BQU0sT0FBTyxHQUE4QixVQUNoRCxNQUFNLEVBQ04sSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJOztRQUVKLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDdkIsTUFBTSxFQUFFLFlBQVksRUFBRSxHQUFHLElBQUksQ0FBQztRQUU5QixNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFN0MsTUFBTSxhQUFhLEdBQUcsRUFBRTthQUNyQixVQUFVLENBQUMsUUFBUSxDQUFDO2FBQ3BCLFNBQVMsQ0FBQztZQUNULEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3hFO2dCQUNFLFVBQVUsRUFBRTtvQkFDVixFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO29CQUN6QixVQUFVLEVBQUUsUUFBUTtpQkFDckI7YUFDRjtTQUNGLENBQUM7YUFDRCxPQUFPLEVBQUUsQ0FBQztRQUViLE1BQU0sZUFBZSxHQUFHLEVBQUU7YUFDdkIsVUFBVSxDQUFDLFlBQVksQ0FBQzthQUN4QixTQUFTLENBQUM7WUFDVCxFQUFFLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUM1QjtnQkFDRSxVQUFVLEVBQUU7b0JBQ1YsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTtvQkFDekIsVUFBVSxFQUFFLFVBQVU7aUJBQ3ZCO2FBQ0Y7U0FDRixDQUFDO2FBQ0QsT0FBTyxFQUFFLENBQUM7UUFFYixNQUFNLFdBQVcsR0FBRyxFQUFFO2FBQ25CLFVBQVUsQ0FBQyxhQUFhLENBQUM7YUFDekIsU0FBUyxDQUFDO1lBQ1QsRUFBRSxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDNUI7Z0JBQ0UsVUFBVSxFQUFFO29CQUNWLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7b0JBQ3pCLFVBQVUsRUFBRSxZQUFZO2lCQUN6QjthQUNGO1NBQ0YsQ0FBQzthQUNELE9BQU8sRUFBRSxDQUFDO1FBRWIsTUFBTSxPQUFPLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDO1lBQ2hDLGFBQWE7WUFDYixlQUFlO1lBQ2YsV0FBVztTQUNaLENBQUMsQ0FBQztRQUVILE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUN4QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDeEIsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQyxFQUFFLEVBQUUsQ0FBUSxDQUFDO0lBQ2hCLENBQUM7Q0FBQSxDQUFDO0FBNURXLFFBQUEsT0FBTyxXQTREbEIifQ==