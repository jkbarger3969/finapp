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
exports.default = () => __awaiter(void 0, void 0, void 0, function* () {
    const DB_USER = process.env.DB_USER || undefined;
    const DB_PASS = process.env.DB_PASS || undefined;
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || undefined;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || undefined;
    const JWT_SECRET = process.env.JWT_SECRET || undefined;
    return {
        DB_USER,
        DB_PASS,
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        JWT_SECRET,
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcmV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZWNyZXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsa0JBQWUsR0FBUyxFQUFFO0lBQ3hCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQztJQUNqRCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxTQUFTLENBQUM7SUFDakQsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixJQUFJLFNBQVMsQ0FBQztJQUNuRSxNQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLElBQUksU0FBUyxDQUFDO0lBQzNFLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLFNBQVMsQ0FBQztJQUV2RCxPQUFPO1FBQ0wsT0FBTztRQUNQLE9BQU87UUFDUCxnQkFBZ0I7UUFDaEIsb0JBQW9CO1FBQ3BCLFVBQVU7S0FDWCxDQUFDO0FBQ0osQ0FBQyxDQUFBLENBQUMifQ==