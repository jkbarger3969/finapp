import {QueryResolvers, PaymentMethodResolvers} from '../graphTypes';
import {nodeFieldResolver, nodeDocResolver} from "./utils/nodeResolver";

export const paymentMethods:QueryResolvers['paymentMethods'] = 
  async (parent, args, context, info) => 
{

  const {db} = context;

  const payMethodResults = await db.collection("paymentMethods")
    .aggregate([
      {$addFields:{id:{$toString:"$_id"}}}
    ]).toArray();

  return payMethodResults;

}

// TODO: implement ancestors

export const PaymentMethod:PaymentMethodResolvers = {
  parent:nodeFieldResolver
};