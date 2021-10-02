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
exports.validateEntity = void 0;
const business_1 = require("../business");
const department_1 = require("../department");
const person_1 = require("../person");
exports.validateEntity = {
    exists: ({ entity: { type, id: entityId }, accountingDb, }) => __awaiter(void 0, void 0, void 0, function* () {
        switch (type) {
            case "Business":
                yield business_1.validateBusiness.exists({
                    business: entityId,
                    accountingDb,
                });
            case "Department":
                yield department_1.validateDepartment.exists({
                    department: entityId,
                    accountingDb,
                });
                break;
            case "Person":
                yield person_1.validatePerson.exists({
                    person: entityId,
                    accountingDb,
                });
        }
    }),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXR5VmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvZW50aXR5L2VudGl0eVZhbGlkYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBRUEsMENBQStDO0FBQy9DLDhDQUFtRDtBQUNuRCxzQ0FBMkM7QUFFOUIsUUFBQSxjQUFjLEdBQUc7SUFDNUIsTUFBTSxFQUFFLENBQU8sRUFDYixNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUM5QixZQUFZLEdBSWIsRUFBRSxFQUFFO1FBQ0gsUUFBUSxJQUFJLEVBQUU7WUFDWixLQUFLLFVBQVU7Z0JBQ2IsTUFBTSwyQkFBZ0IsQ0FBQyxNQUFNLENBQUM7b0JBQzVCLFFBQVEsRUFBRSxRQUFRO29CQUNsQixZQUFZO2lCQUNiLENBQUMsQ0FBQztZQUNMLEtBQUssWUFBWTtnQkFDZixNQUFNLCtCQUFrQixDQUFDLE1BQU0sQ0FBQztvQkFDOUIsVUFBVSxFQUFFLFFBQVE7b0JBQ3BCLFlBQVk7aUJBQ2IsQ0FBQyxDQUFDO2dCQUNILE1BQU07WUFDUixLQUFLLFFBQVE7Z0JBQ1gsTUFBTSx1QkFBYyxDQUFDLE1BQU0sQ0FBQztvQkFDMUIsTUFBTSxFQUFFLFFBQVE7b0JBQ2hCLFlBQVk7aUJBQ2IsQ0FBQyxDQUFDO1NBQ047SUFDSCxDQUFDLENBQUE7Q0FDRixDQUFDIn0=