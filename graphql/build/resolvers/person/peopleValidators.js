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
exports.validatePerson = void 0;
const apollo_server_core_1 = require("apollo-server-core");
exports.validatePerson = {
    exists: ({ person, accountingDb, }) => __awaiter(void 0, void 0, void 0, function* () {
        if (!(yield accountingDb.findOne({
            collection: "people",
            filter: {
                _id: person,
            },
            options: {
                projection: {
                    _id: true,
                },
            },
        }))) {
            throw new apollo_server_core_1.UserInputError(`"Person" id "${person.toHexString()}" does not exists.`);
        }
    }),
    newPerson: ({ newPerson }) => {
        if (newPerson.name.first.length < 3) {
            throw new apollo_server_core_1.UserInputError(`"NewPerson.name.first" is too short.`);
        }
        if (newPerson.name.last.length < 3) {
            throw new apollo_server_core_1.UserInputError(`"NewPerson.name.last" is too short.`);
        }
        /* Keep the following code for future use.
        if (!(newPerson.email || newPerson.phone)) {
          throw new UserInputError(
            `"NewPerson.email" or "NewPerson.phone" is required.`
          );
        } */
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVvcGxlVmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvcGVyc29uL3Blb3BsZVZhbGlkYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkRBQW9EO0FBTXZDLFFBQUEsY0FBYyxHQUFHO0lBQzVCLE1BQU0sRUFBRSxDQUFPLEVBQ2IsTUFBTSxFQUNOLFlBQVksR0FJYixFQUFFLEVBQUU7UUFDSCxJQUNFLENBQUMsQ0FBQyxNQUFNLFlBQVksQ0FBQyxPQUFPLENBQUM7WUFDM0IsVUFBVSxFQUFFLFFBQVE7WUFDcEIsTUFBTSxFQUFFO2dCQUNOLEdBQUcsRUFBRSxNQUFNO2FBQ1o7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsVUFBVSxFQUFFO29CQUNWLEdBQUcsRUFBRSxJQUFJO2lCQUNWO2FBQ0Y7U0FDRixDQUFDLENBQUMsRUFDSDtZQUNBLE1BQU0sSUFBSSxtQ0FBYyxDQUN0QixnQkFBZ0IsTUFBTSxDQUFDLFdBQVcsRUFBRSxvQkFBb0IsQ0FDekQsQ0FBQztTQUNIO0lBQ0gsQ0FBQyxDQUFBO0lBQ0QsU0FBUyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQTRCLEVBQUUsRUFBRTtRQUNyRCxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDbkMsTUFBTSxJQUFJLG1DQUFjLENBQUMsc0NBQXNDLENBQUMsQ0FBQztTQUNsRTtRQUVELElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNsQyxNQUFNLElBQUksbUNBQWMsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1NBQ2pFO1FBRUQ7Ozs7O1lBS0k7SUFDTixDQUFDO0NBQ08sQ0FBQyJ9