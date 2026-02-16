import { QueryResolvers } from "../../graphTypes";

export const categoryGroups: QueryResolvers["categoryGroups"] = async (
  _,
  __,
  { dataSources: { accountingDb } }
) => {
  const categories = await accountingDb.find({
    collection: "categories",
    filter: { groupName: { $exists: true, $ne: null } },
  });

  const uniqueGroups = new Set<string>();
  for (const cat of categories) {
    if (cat.groupName) {
      uniqueGroups.add(cat.groupName);
    }
  }

  return Array.from(uniqueGroups).sort();
};
