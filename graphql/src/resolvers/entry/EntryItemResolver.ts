import { EntryItemResolvers } from "../../graphTypes";
import { category as lookUpCategory } from "../category";
// import lookUpDepartment from "../department/department";

const department: EntryItemResolvers["department"] = async (
  doc,
  args,
  context,
  info
) => {
  return null;
};

const category: EntryItemResolvers["category"] = async (
  doc,
  args,
  context,
  info
) => {
  // category is optional in type EntryItem
  const cat = doc?.category as any;
  if (cat && "node" in cat && "id" in cat) {
    return lookUpCategory(
      doc,
      { id: cat.id?.toHexString() || cat.id },
      context,
      info
    );
  }

  return cat ?? null;
};

const EntryItem: EntryItemResolvers = {
  department,
  category,
  total: (doc) => doc.total,
};

export default EntryItem;
