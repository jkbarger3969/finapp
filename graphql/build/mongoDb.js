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
        console.log(`Closing db "${name}" on exit.`);
        closing.push(client
            .close()
            .then(() => {
            console.log(`Closed db "${name}" on exit.`);
        })
            .catch((err) => {
            const errorMsg = err && "message" in err ? err.message : err;
            console.error(`Failed to close db "${name}" on exit. ${errorMsg}`);
        }));
    }
    yield Promise.all(closing);
    cb();
}));
exports.default = ({ dbHost, dbPort, dbUser, dbPass, db, }) => __awaiter(void 0, void 0, void 0, function* () {
    const uri = `mongodb://${dbHost}:${dbPort}`;
    const clientId = `${uri}${dbUser}${dbPass}`;
    if (!clients.has(clientId)) {
        const client = yield mongodb_1.MongoClient.connect(uri /* { useUnifiedTopology: true } */);
        clients.set(clientId, { name: db, client });
    }
    const client = clients.get(clientId).client;
    return { client, db: client.db(db) };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ29EYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tb25nb0RiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsNENBQTRDO0FBQzVDLHFDQUEwQztBQUUxQyxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBaUQsQ0FBQztBQUV6RSwrQ0FBK0M7QUFDL0MsUUFBUSxDQUFDLENBQU8sRUFBRSxFQUFFLEVBQUU7SUFDcEIsTUFBTSxPQUFPLEdBQW9CLEVBQUUsQ0FBQztJQUVwQyxLQUFLLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFO1FBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxJQUFJLFlBQVksQ0FBQyxDQUFDO1FBRTdDLE9BQU8sQ0FBQyxJQUFJLENBQ1YsTUFBTTthQUNILEtBQUssRUFBRTthQUNQLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxZQUFZLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUM7YUFDRCxLQUFLLENBQUMsQ0FBQyxHQUFnQixFQUFFLEVBQUU7WUFDMUIsTUFBTSxRQUFRLEdBQUcsR0FBRyxJQUFJLFNBQVMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUM3RCxPQUFPLENBQUMsS0FBSyxDQUFDLHVCQUF1QixJQUFJLGNBQWMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNyRSxDQUFDLENBQUMsQ0FDTCxDQUFDO0tBQ0g7SUFFRCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFM0IsRUFBRSxFQUFFLENBQUM7QUFDUCxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsa0JBQWUsQ0FBTyxFQUNwQixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sRUFBRSxHQU9ILEVBQTRDLEVBQUU7SUFDN0MsTUFBTSxHQUFHLEdBQUcsYUFBYSxNQUFNLElBQUksTUFBTSxFQUFFLENBQUM7SUFDNUMsTUFBTSxRQUFRLEdBQUcsR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLE1BQU0sRUFBRSxDQUFDO0lBRTVDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQzFCLE1BQU0sTUFBTSxHQUFHLE1BQU0scUJBQVcsQ0FBQyxPQUFPLENBQ3RDLEdBQUcsQ0FBQyxrQ0FBa0MsQ0FDdkMsQ0FBQztRQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0tBQzdDO0lBRUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFFNUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3ZDLENBQUMsQ0FBQSxDQUFDIn0=