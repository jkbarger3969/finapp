import { ObjectId } from "mongodb";
import { BudgetResolvers, BudgetOwnerResolvers } from "../../graphTypes";
import { Rational } from "../../utils/mongoRational";
export interface BudgetDbRecord {
    _id: ObjectId;
    amount: Rational;
    fiscalYear: ObjectId;
    owner: {
        type: "Department" | "Business";
        id: ObjectId;
    };
}
export declare const BudgetOwner: BudgetOwnerResolvers;
export declare const Budget: BudgetResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../dataSources/accountingDb/types").BudgetDbRecord>;
