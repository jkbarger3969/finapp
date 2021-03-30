import { ObjectId } from "mongodb";
import { PaymentMethodResolvers } from "../../graphTypes";
import { HistoryObject, HistoricalRoot } from "../utils/DocHistory";
import { Context } from "../../types";

export interface PaymentMethodDbRecord extends HistoricalRoot {
  _id: ObjectId;
  parent: ObjectId;
  allowChildren: boolean;
  name: HistoryObject<string>[];
  active: HistoryObject<boolean>[];
}

const children: PaymentMethodResolvers<
  Context,
  PaymentMethodDbRecord
>["children"] = ({ _id }, _, { db }) =>
  db.collection("paymentMethods").find({ parent: _id }).toArray();

const parent: PaymentMethodResolvers<
  Context,
  PaymentMethodDbRecord
>["parent"] = ({ parent }, _, { db }) =>
  parent ? db.collection("paymentMethods").findOne({ _id: parent }) : null;

const PaymentMethodResolver: PaymentMethodResolvers<
  Context,
  PaymentMethodDbRecord
> = {
  id: ({ _id }) => _id.toString(),
  name: ({ name }) => name[0].value,
  active: ({ active }) => active[0].value,
  parent,
  children,
};

export const PaymentMethod = (PaymentMethodResolver as unknown) as PaymentMethodResolvers;
