import { JournalEntryItemResolvers } from "../../graphTypes";
import { journalEntryCategory as lookUpCategory } from "../journalEntryCategory";
import { department as lookUpDepartment } from "../departments";

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
      { id: dept?.toHexString() || dept },
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
      { id: cat?.toHexString() || cat },
      context,
      info
    );
  }

  return cat ?? null;
};

const JournalEntryItem: JournalEntryItemResolvers = {
  department,
  category,
};

export default JournalEntryItem;
