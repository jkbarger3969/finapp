export interface PersonRecord {
  id: string;
  name: {
    first: string;
    last: string;
  };
  hidden?: boolean;
}

export interface BusinessRecord {
  id: string;
  name: string;
  hidden?: boolean;
}

export interface CategoryRecord {
  id: string;
  name: string;
  displayName?: string | null;
  type: string;
  hidden?: boolean;
  groupName?: string | null;
  sortOrder?: number | null;
}

export interface DepartmentParentDepartment {
  __typename: "Department";
  id: string;
  name: string;
}

export interface DepartmentParentBusiness {
  __typename: "Business";
  id: string;
  name: string;
}

export type DepartmentParent =
  | DepartmentParentDepartment
  | DepartmentParentBusiness
  | null;

export interface DepartmentRecord {
  id: string;
  name: string;
  parent?: DepartmentParent;
}

export interface GetFilterOptionsData {
  people: PersonRecord[];
  businesses: BusinessRecord[];
  categories: CategoryRecord[];
  departments: DepartmentRecord[];
}