import { JournalEntryItemResolvers } from "../../graphTypes";
import { journalEntryCategory as lookUpCategory } from "../journalEntryCategory";
import { department as lookUpDepartment } from "../departments";
import { fractionToRational } from "../../utils/rational";

const department: JournalEntryItemResolvers["department"] = async (
  doc,
  args,
  context,
  info
) => {
  const dept = doc?.department as any;

  if (dept && "node" in dept && "id" in dept) {
    return lookUpDepartment(
      doc,
      { id: dept.id?.toHexString() || dept.id },
      context,
      info
    );
  }

  return dept ?? null;
};

const category: JournalEntryItemResolvers["category"] = async (
  doc,
  args,
  context,
  info
) => {
  // category is optional in type JournalEntryItem
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

const JournalEntryItem: JournalEntryItemResolvers = {
  department,
  category,
  total: (doc) => fractionToRational((doc.total ?? doc) as any),
};

export default JournalEntryItem;
