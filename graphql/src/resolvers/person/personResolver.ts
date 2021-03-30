import { ObjectId } from "mongodb";

import { PersonResolvers } from "../../graphTypes";
import { Context } from "../../types";

export interface PersonDbRecord {
  _id: ObjectId;
  name: {
    first: string;
    last: string;
  };
}

const PersonResolver: PersonResolvers<Context, PersonDbRecord> = {
  id: ({ _id }) => _id.toString(),
};

export const Person = (PersonResolver as unknown) as PersonResolvers;
