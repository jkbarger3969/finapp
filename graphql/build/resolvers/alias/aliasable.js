"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAliasableResolvers = exports.whereAliases = void 0;
const iterableFns_1 = require("../../utils/iterableFns");
const queryUtils_1 = require("../utils/queryUtils");
const whereAliases = (instanceId, type, where) => {
    const filter = {
        id: instanceId,
        type: type,
    };
    for (const key of (0, iterableFns_1.iterateOwnKeys)(where)) {
        switch (key) {
            case "id":
                filter._id = (0, queryUtils_1.whereId)(where[key]);
                break;
        }
    }
    return filter;
};
exports.whereAliases = whereAliases;
const getAliasableResolvers = (type) => ({
    aliases: ({ _id }, { where = {} }, { dataSources: { accountingDb } }) => accountingDb.find({
        collection: "aliases",
        filter: (0, exports.whereAliases)(_id, type, where),
    }),
});
exports.getAliasableResolvers = getAliasableResolvers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxpYXNhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9hbGlhcy9hbGlhc2FibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EseURBQXlEO0FBQ3pELG9EQUE4QztBQUV2QyxNQUFNLFlBQVksR0FBRyxDQUMxQixVQUFvQixFQUNwQixJQUFZLEVBQ1osS0FBbUIsRUFDUSxFQUFFO0lBQzdCLE1BQU0sTUFBTSxHQUE4QjtRQUN4QyxFQUFFLEVBQUUsVUFBVTtRQUNkLElBQUksRUFBRSxJQUFJO0tBQ1gsQ0FBQztJQUVGLEtBQUssTUFBTSxHQUFHLElBQUksSUFBQSw0QkFBYyxFQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3ZDLFFBQVEsR0FBRyxFQUFFO1lBQ1gsS0FBSyxJQUFJO2dCQUNQLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBQSxvQkFBTyxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxNQUFNO1NBQ1Q7S0FDRjtJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMsQ0FBQztBQW5CVyxRQUFBLFlBQVksZ0JBbUJ2QjtBQUVLLE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxJQUFZLEVBQU8sRUFBRSxDQUFDLENBQUM7SUFDM0QsT0FBTyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUN0RSxZQUFZLENBQUMsSUFBSSxDQUFDO1FBQ2hCLFVBQVUsRUFBRSxTQUFTO1FBQ3JCLE1BQU0sRUFBRSxJQUFBLG9CQUFZLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUM7S0FDdkMsQ0FBQztDQUNMLENBQUMsQ0FBQztBQU5VLFFBQUEscUJBQXFCLHlCQU0vQiJ9