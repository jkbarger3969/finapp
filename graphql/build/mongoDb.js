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
    }
    yield Promise.all(closing);
    cb();
}));
exports.default = ({ dbHost, dbPort, dbUser, dbPass, db, }) => __awaiter(void 0, void 0, void 0, function* () {
    const uri = `mongodb://${dbHost}:${dbPort}`;
    const clientId = `${uri}${dbUser}${dbPass}`;
    if (!clients.has(clientId)) {
        const client = yield mongodb_1.MongoClient.connect(uri, { useUnifiedTopology: true });
        clients.set(clientId, { name: db, client });
    }
    return clients.get(clientId).client.db(db);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ29EYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tb25nb0RiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsNENBQTRDO0FBQzVDLHFDQUEwQztBQUUxQyxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBaUQsQ0FBQztBQUV6RSwrQ0FBK0M7QUFDL0MsUUFBUSxDQUFDLENBQU8sRUFBRSxFQUFFLEVBQUU7SUFDcEIsTUFBTSxPQUFPLEdBQW9CLEVBQUUsQ0FBQztJQUVwQyxLQUFLLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFO1FBQy9DLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxJQUFJLFlBQVksQ0FBQyxDQUFDO1lBRTdDLE9BQU8sQ0FBQyxJQUFJLENBQ1YsTUFBTTtpQkFDSCxLQUFLLEVBQUU7aUJBQ1AsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxZQUFZLENBQUMsQ0FBQztZQUM5QyxDQUFDLENBQUM7aUJBQ0QsS0FBSyxDQUFDLENBQUMsR0FBZ0IsRUFBRSxFQUFFO2dCQUMxQixNQUFNLFFBQVEsR0FBRyxHQUFHLElBQUksU0FBUyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUM3RCxPQUFPLENBQUMsS0FBSyxDQUFDLHVCQUF1QixJQUFJLGNBQWMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNyRSxDQUFDLENBQUMsQ0FDTCxDQUFDO1NBQ0g7S0FDRjtJQUVELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUUzQixFQUFFLEVBQUUsQ0FBQztBQUNQLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxrQkFBZSxDQUFPLEVBQ3BCLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixFQUFFLEdBT0gsRUFBZSxFQUFFO0lBQ2hCLE1BQU0sR0FBRyxHQUFHLGFBQWEsTUFBTSxJQUFJLE1BQU0sRUFBRSxDQUFDO0lBQzVDLE1BQU0sUUFBUSxHQUFHLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQztJQUU1QyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUMxQixNQUFNLE1BQU0sR0FBRyxNQUFNLHFCQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFFNUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7S0FDN0M7SUFFRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM3QyxDQUFDLENBQUEsQ0FBQyJ9