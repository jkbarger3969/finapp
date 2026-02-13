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
exports.FiscalYear = void 0;
const FiscalYearResolver = {
    id: ({ _id }) => _id.toString(),
    archived: ({ archived }) => archived || false,
    archivedAt: ({ archivedAt }) => archivedAt || null,
    archivedBy: ({ archivedById }, _, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
        if (!archivedById)
            return null;
        const user = yield accountingDb.db.collection("users").findOne({ _id: archivedById });
        return user;
    }),
};
exports.FiscalYear = FiscalYearResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlzY2FsWWVhclJlc29sdmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvZmlzY2FsWWVhci9maXNjYWxZZWFyUmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQWNBLE1BQU0sa0JBQWtCLEdBQXFEO0lBQzNFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7SUFDL0IsUUFBUSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUMsUUFBUSxJQUFJLEtBQUs7SUFDN0MsVUFBVSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsVUFBVSxJQUFJLElBQUk7SUFDbEQsVUFBVSxFQUFFLENBQU8sRUFBRSxZQUFZLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFLEVBQUU7UUFDM0UsSUFBSSxDQUFDLFlBQVk7WUFBRSxPQUFPLElBQUksQ0FBQztRQUMvQixNQUFNLElBQUksR0FBRyxNQUFNLFlBQVksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQ3RGLE9BQU8sSUFBVyxDQUFDO0lBQ3JCLENBQUMsQ0FBQTtDQUNGLENBQUM7QUFFVyxRQUFBLFVBQVUsR0FBSSxrQkFBcUQsQ0FBQyJ9