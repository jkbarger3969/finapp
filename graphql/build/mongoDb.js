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
const exitHook = require("async-exit-hook");
const mongodb_1 = require("mongodb");
const clients = new Map();
// Ensure db connections are cleaned up on exit
exitHook((cb) => __awaiter(void 0, void 0, void 0, function* () {
    const closing = [];
    for (const { name, client } of clients.values()) {
        if (client.isConnected()) {
            console.log(`Closing db "${name}" on exit.`);
            closing.push(client.close().then(() => {
                console.log(`Closed db "${name}" on exit.`);
            }).catch((err) => {
                const errorMsg = err && 'message' in err ? err.message : err;
                console.error(`Failed to close db "${name}" on exit. ${errorMsg}`);
            }));
        }
    }
    yield Promise.all(closing);
    cb();
}));
exports.default = ({ dbHost, dbPort, dbUser, dbPass, db }) => __awaiter(void 0, void 0, void 0, function* () {
    const uri = `mongodb://${dbHost}:${dbPort}`;
    const clientId = `${uri}${dbUser}${dbPass}`;
    if (!clients.has(clientId)) {
        const client = yield mongodb_1.MongoClient.connect(uri, { useUnifiedTopology: true });
        clients.set(clientId, { name: db, client });
    }
    return clients.get(clientId).client.db(db);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ29EYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tb25nb0RiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQ0EsNENBQTRDO0FBQzVDLHFDQUF3QztBQUV4QyxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBNkMsQ0FBQztBQUVyRSwrQ0FBK0M7QUFDL0MsUUFBUSxDQUFDLENBQU8sRUFBRSxFQUFFLEVBQUU7SUFFcEIsTUFBTSxPQUFPLEdBQW1CLEVBQUUsQ0FBQztJQUVuQyxLQUFJLE1BQU0sRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFDLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFO1FBRzVDLElBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBRXZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxJQUFJLFlBQVksQ0FBQyxDQUFDO1lBRTdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFFLEVBQUU7Z0JBRW5DLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxJQUFJLFlBQVksQ0FBQyxDQUFDO1lBRTlDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBRSxDQUFDLEdBQWUsRUFBRSxFQUFFO2dCQUU1QixNQUFNLFFBQVEsR0FBRyxHQUFHLElBQUksU0FBUyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUM3RCxPQUFPLENBQUMsS0FBSyxDQUFDLHVCQUF1QixJQUFJLGNBQWMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUVyRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBRUw7S0FFRjtJQUVELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUUzQixFQUFFLEVBQUUsQ0FBQztBQUVQLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxrQkFBZSxDQUFPLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFNeEQsRUFBYyxFQUFFO0lBRWYsTUFBTSxHQUFHLEdBQUcsYUFBYSxNQUFNLElBQUksTUFBTSxFQUFFLENBQUM7SUFDNUMsTUFBTSxRQUFRLEdBQUcsR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLE1BQU0sRUFBRSxDQUFDO0lBRTVDLElBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBRXpCLE1BQU0sTUFBTSxHQUFHLE1BQU0scUJBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFDLEVBQUMsa0JBQWtCLEVBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUV4RSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztLQUUxQztJQUVELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRTdDLENBQUMsQ0FBQSxDQUFBIn0=