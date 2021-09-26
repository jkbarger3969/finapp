import { Alias, AliasType } from "../apollo/graphTypes";

export const composeAlias = (
  aliases: Pick<Alias, "type" | "name">[],
  name: string
): string => {
  let prefix = "";
  let alias = name;
  let postfix = "";

  for (const { name, type } of aliases) {
    switch (type) {
      case AliasType.Alias:
        alias = name;
        break;
      case AliasType.PrefixDescendants:
        prefix = `${name}-`;
        break;
      case AliasType.PostfixDescendants:
        postfix = `-${name}`;
        break;
    }
  }

  return prefix + alias + postfix;
};
