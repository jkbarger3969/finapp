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
exports.getAliases = void 0;
/**
 * @returns All aliases that apply to the target.  Both direct aliases and
 * inherited pre and post fixes.
 */
const getAliases = (targetType, targetId, db) => __awaiter(void 0, void 0, void 0, function* () {
    const aliases = [];
    const promises = [];
    // Direct aliases
    promises.push(db
        .collection("aliases")
        .find({
        "target.type": targetType,
        "target.id": targetId,
        type: "Alias",
    })
        .toArray()
        .then((results) => {
        aliases.push(...results);
    }));
    // Inherited aliases
    promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
        const promises = [];
        switch (targetType) {
            case "Category":
                {
                    let { parent } = yield db
                        .collection("categories")
                        .findOne({ _id: targetId }, {
                        projection: {
                            parent: true,
                        },
                    });
                    while (parent) {
                        promises.push(db
                            .collection("aliases")
                            .find({
                            "target.type": targetType,
                            "target.id": parent,
                            type: { $ne: "Alias" },
                        })
                            .toArray()
                            .then((results) => {
                            aliases.push(...results);
                        }));
                        ({ parent } = yield db
                            .collection("categories")
                            .findOne({ _id: parent }, {
                            projection: {
                                parent: true,
                            },
                        }));
                    }
                }
                break;
            case "Department":
                {
                    let { parent } = yield db
                        .collection("departments")
                        .findOne({ _id: targetId }, {
                        projection: {
                            parent: true,
                        },
                    });
                    while (parent.type === "Department") {
                        promises.push(db
                            .collection("aliases")
                            .find({
                            "target.type": targetType,
                            "target.id": parent.id,
                            type: { $ne: "Alias" },
                        })
                            .toArray()
                            .then((results) => {
                            aliases.push(...results);
                        }));
                        ({ parent } = yield db
                            .collection("departments")
                            .findOne({ _id: parent.id }, {
                            projection: {
                                parent: true,
                            },
                        }));
                    }
                }
                break;
        }
        yield Promise.all(promises);
    }))());
    yield Promise.all(promises);
    return aliases;
});
exports.getAliases = getAliases;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2FsaWFzL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBOzs7R0FHRztBQUNJLE1BQU0sVUFBVSxHQUFHLENBQ3hCLFVBQTRCLEVBQzVCLFFBQWtCLEVBQ2xCLEVBQU0sRUFDb0IsRUFBRTtJQUM1QixNQUFNLE9BQU8sR0FBb0IsRUFBRSxDQUFDO0lBRXBDLE1BQU0sUUFBUSxHQUFvQixFQUFFLENBQUM7SUFFckMsaUJBQWlCO0lBQ2pCLFFBQVEsQ0FBQyxJQUFJLENBQ1gsRUFBRTtTQUNDLFVBQVUsQ0FBZ0IsU0FBUyxDQUFDO1NBQ3BDLElBQUksQ0FBQztRQUNKLGFBQWEsRUFBRSxVQUFVO1FBQ3pCLFdBQVcsRUFBRSxRQUFRO1FBQ3JCLElBQUksRUFBRSxPQUFPO0tBQ2QsQ0FBQztTQUNELE9BQU8sRUFBRTtTQUNULElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1FBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztJQUMzQixDQUFDLENBQUMsQ0FDTCxDQUFDO0lBRUYsb0JBQW9CO0lBQ3BCLFFBQVEsQ0FBQyxJQUFJLENBQ1gsQ0FBQyxHQUFTLEVBQUU7UUFDVixNQUFNLFFBQVEsR0FBb0IsRUFBRSxDQUFDO1FBQ3JDLFFBQVEsVUFBVSxFQUFFO1lBQ2xCLEtBQUssVUFBVTtnQkFDYjtvQkFDRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxFQUFFO3lCQUN0QixVQUFVLENBQW1DLFlBQVksQ0FBQzt5QkFDMUQsT0FBTyxDQUNOLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUNqQjt3QkFDRSxVQUFVLEVBQUU7NEJBQ1YsTUFBTSxFQUFFLElBQUk7eUJBQ2I7cUJBQ0YsQ0FDRixDQUFDO29CQUVKLE9BQU8sTUFBTSxFQUFFO3dCQUNiLFFBQVEsQ0FBQyxJQUFJLENBQ1gsRUFBRTs2QkFDQyxVQUFVLENBQWdCLFNBQVMsQ0FBQzs2QkFDcEMsSUFBSSxDQUFDOzRCQUNKLGFBQWEsRUFBRSxVQUFVOzRCQUN6QixXQUFXLEVBQUUsTUFBTTs0QkFDbkIsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRTt5QkFDdkIsQ0FBQzs2QkFDRCxPQUFPLEVBQUU7NkJBQ1QsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7NEJBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQzt3QkFDM0IsQ0FBQyxDQUFDLENBQ0wsQ0FBQzt3QkFFRixDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxFQUFFOzZCQUNuQixVQUFVLENBQW1DLFlBQVksQ0FBQzs2QkFDMUQsT0FBTyxDQUNOLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUNmOzRCQUNFLFVBQVUsRUFBRTtnQ0FDVixNQUFNLEVBQUUsSUFBSTs2QkFDYjt5QkFDRixDQUNGLENBQUMsQ0FBQztxQkFDTjtpQkFDRjtnQkFDRCxNQUFNO1lBQ1IsS0FBSyxZQUFZO2dCQUNmO29CQUNFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLEVBQUU7eUJBQ3RCLFVBQVUsQ0FBcUMsYUFBYSxDQUFDO3lCQUM3RCxPQUFPLENBQ04sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQ2pCO3dCQUNFLFVBQVUsRUFBRTs0QkFDVixNQUFNLEVBQUUsSUFBSTt5QkFDYjtxQkFDRixDQUNGLENBQUM7b0JBRUosT0FBTyxNQUFNLENBQUMsSUFBSSxLQUFLLFlBQVksRUFBRTt3QkFDbkMsUUFBUSxDQUFDLElBQUksQ0FDWCxFQUFFOzZCQUNDLFVBQVUsQ0FBZ0IsU0FBUyxDQUFDOzZCQUNwQyxJQUFJLENBQUM7NEJBQ0osYUFBYSxFQUFFLFVBQVU7NEJBQ3pCLFdBQVcsRUFBRSxNQUFNLENBQUMsRUFBRTs0QkFDdEIsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRTt5QkFDdkIsQ0FBQzs2QkFDRCxPQUFPLEVBQUU7NkJBQ1QsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7NEJBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQzt3QkFDM0IsQ0FBQyxDQUFDLENBQ0wsQ0FBQzt3QkFFRixDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxFQUFFOzZCQUNuQixVQUFVLENBQXFDLGFBQWEsQ0FBQzs2QkFDN0QsT0FBTyxDQUNOLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFDbEI7NEJBQ0UsVUFBVSxFQUFFO2dDQUNWLE1BQU0sRUFBRSxJQUFJOzZCQUNiO3lCQUNGLENBQ0YsQ0FBQyxDQUFDO3FCQUNOO2lCQUNGO2dCQUNELE1BQU07U0FDVDtRQUVELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5QixDQUFDLENBQUEsQ0FBQyxFQUFFLENBQ0wsQ0FBQztJQUVGLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUU1QixPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDLENBQUEsQ0FBQztBQXhIVyxRQUFBLFVBQVUsY0F3SHJCIn0=