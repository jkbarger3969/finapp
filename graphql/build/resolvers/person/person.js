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
const mongodb_1 = require("mongodb");
const mongoUtils_1 = require("../utils/mongoUtils");
const person = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    return ((yield context.db
        .collection("people")
        .aggregate([
        {
            $match: {
                _id: new mongodb_1.ObjectId(args.id),
            },
        },
        mongoUtils_1.addId,
    ])
        .toArray())[0] || null);
});
exports.default = person;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyc29uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9wZXJzb24vcGVyc29uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBRW5DLG9EQUE0QztBQUU1QyxNQUFNLE1BQU0sR0FBNkIsQ0FDdkMsTUFBTSxFQUNOLElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7SUFDRixPQUFPLENBQ0wsQ0FDRSxNQUFNLE9BQU8sQ0FBQyxFQUFFO1NBQ2IsVUFBVSxDQUFDLFFBQVEsQ0FBQztTQUNwQixTQUFTLENBQUM7UUFDVDtZQUNFLE1BQU0sRUFBRTtnQkFDTixHQUFHLEVBQUUsSUFBSSxrQkFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7YUFDM0I7U0FDRjtRQUNELGtCQUFLO0tBQ04sQ0FBQztTQUNELE9BQU8sRUFBRSxDQUNiLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUNiLENBQUM7QUFDSixDQUFDLENBQUEsQ0FBQztBQUVGLGtCQUFlLE1BQU0sQ0FBQyJ9