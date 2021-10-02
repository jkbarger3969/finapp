"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entryRefunds = void 0;
const entries_1 = require("./entries");
const getPipeline = (filterQuery) => [
    { $match: filterQuery },
    { $unwind: "$refunds" },
    { $match: filterQuery },
    {
        $project: {
            refunds: true,
        },
    },
];
const entryRefunds = (_, { where }, { db }) => {
    const query = where ? (0, entries_1.whereEntryRefunds)(where, db) : {};
    if (query instanceof Promise) {
        return query
            .then((query) => db.collection("entries").aggregate(getPipeline(query)).toArray())
            .then((entries) => entries.map(({ refunds }) => refunds));
    }
    else {
        return db
            .collection("entries")
            .aggregate(getPipeline(query))
            .toArray()
            .then((entries) => entries.map(({ refunds }) => refunds));
    }
};
exports.entryRefunds = entryRefunds;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlSZWZ1bmRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9lbnRyeS9lbnRyeVJlZnVuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsdUNBQThDO0FBRTlDLE1BQU0sV0FBVyxHQUFHLENBQUMsV0FBaUMsRUFBWSxFQUFFLENBQUM7SUFDbkUsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFO0lBQ3ZCLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRTtJQUN2QixFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUU7SUFDdkI7UUFDRSxRQUFRLEVBQUU7WUFDUixPQUFPLEVBQUUsSUFBSTtTQUNkO0tBQ0Y7Q0FDRixDQUFDO0FBRUssTUFBTSxZQUFZLEdBQW1DLENBQzFELENBQUMsRUFDRCxFQUFFLEtBQUssRUFBRSxFQUNULEVBQUUsRUFBRSxFQUFFLEVBQ04sRUFBRTtJQUNGLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBQSwyQkFBaUIsRUFBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUV4RCxJQUFJLEtBQUssWUFBWSxPQUFPLEVBQUU7UUFDNUIsT0FBTyxLQUFLO2FBQ1QsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FDZCxFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FDakU7YUFDQSxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQzdEO1NBQU07UUFDTCxPQUFPLEVBQUU7YUFDTixVQUFVLENBQUMsU0FBUyxDQUFDO2FBQ3JCLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDN0IsT0FBTyxFQUFFO2FBQ1QsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztLQUM3RDtBQUNILENBQUMsQ0FBQztBQXBCVyxRQUFBLFlBQVksZ0JBb0J2QiJ9