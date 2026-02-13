import { useQuery } from 'urql';
import { useMemo, useState, useEffect, useRef } from 'react';

const GET_ENTRIES_BY_DEPARTMENT = `
  query GetEntriesByDepartment($where: EntriesWhere!, $limit: Int, $offset: Int) {
    entries(where: $where, limit: $limit, offset: $offset) {
      id
      description
      date
      dateOfRecord {
        date
        overrideFiscalYear
      }
      reconciled
      total
      category {
        id
        name
        type
      }
      department {
        id
        name
      }
      source {
        __typename
        ... on Person {
          id
          personName: name {
            first
            last
          }
        }
        ... on Business {
          id
          businessName: name
        }
      }
      refunds {
        id
        date
        description
        total
        reconciled
        paymentMethod {
          currency
          ... on PaymentMethodCard {
            card {
              type
              trailingDigits
            }
          }
          ... on PaymentMethodCheck {
            check {
              checkNumber
            }
          }
        }
      }
      attachments {
        id
      }
      paymentMethod {
        currency
        ... on PaymentMethodCard {
          card {
            type
            trailingDigits
          }
        }
        ... on PaymentMethodCheck {
          check {
            checkNumber
          }
        }
      }
    }
    entriesCount(where: $where)
  }
`;

interface UseTransactionsProps {
  departmentId?: string | null;
  fiscalYearId?: string | null;
  reconcileFilter?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  entryType?: string;
  categoryId?: string;
  personId?: string;
  businessId?: string;
  paginationModel: { page: number; pageSize: number };
  paymentMethodType?: string;
  searchTerm?: string;
}

export function useTransactions({
  departmentId,
  fiscalYearId,
  reconcileFilter = 'ALL',
  startDate,
  endDate,
  entryType = 'ALL',
  categoryId,
  personId,
  businessId,
  paginationModel,
  paymentMethodType = 'ALL',
  searchTerm = '',
}: UseTransactionsProps) {

  // Debounce filter changes to reduce API calls
  const [debouncedFilters, setDebouncedFilters] = useState({
    departmentId,
    fiscalYearId,
    reconcileFilter,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
    entryType,
    categoryId,
    personId,
    businessId,
    paymentMethodType,
    searchTerm,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounced values after 150ms delay
    debounceRef.current = setTimeout(() => {
      setDebouncedFilters({
        departmentId,
        fiscalYearId,
        reconcileFilter,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        entryType,
        categoryId,
        personId,
        businessId,
        paymentMethodType,
        searchTerm,
      });
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [departmentId, fiscalYearId, reconcileFilter, startDate, endDate, entryType, categoryId, personId, businessId, paymentMethodType, searchTerm]);

  // Build GraphQL where clause from debounced filters
  const where = useMemo(() => {
    const baseWhere: any = {
      deleted: false,
    };

    if (debouncedFilters.departmentId) {
      baseWhere.department = { id: { lte: debouncedFilters.departmentId } };
    }

    if (debouncedFilters.fiscalYearId && !debouncedFilters.startDate && !debouncedFilters.endDate) {
      baseWhere.fiscalYear = {
        id: { eq: debouncedFilters.fiscalYearId },
      };
    }

    if (debouncedFilters.reconcileFilter === 'RECONCILED') {
      baseWhere.reconciled = true;
    } else if (debouncedFilters.reconcileFilter === 'UNRECONCILED') {
      baseWhere.reconciled = false;
    }

    if (debouncedFilters.startDate || debouncedFilters.endDate) {
      baseWhere.date = {};
      if (debouncedFilters.startDate) {
        baseWhere.date.gte = debouncedFilters.startDate;
      }
      if (debouncedFilters.endDate) {
        baseWhere.date.lte = debouncedFilters.endDate;
      }
    }

    if (debouncedFilters.entryType !== 'ALL') {
      baseWhere.category = { type: debouncedFilters.entryType };
    }

    if (debouncedFilters.categoryId) {
      baseWhere.category = {
        ...baseWhere.category,
        id: { eq: debouncedFilters.categoryId }
      };
    }

    if (debouncedFilters.personId) {
      baseWhere.source = { people: { id: { eq: debouncedFilters.personId } } };
    } else if (debouncedFilters.businessId) {
      baseWhere.source = { businesses: { id: { eq: debouncedFilters.businessId } } };
    }

    if (debouncedFilters.paymentMethodType && debouncedFilters.paymentMethodType !== 'ALL') {
      baseWhere.paymentMethodType = debouncedFilters.paymentMethodType;
    }

    if (debouncedFilters.searchTerm) {
      const term = debouncedFilters.searchTerm;
      // Using regex for case-insensitive partial match
      const regex = { pattern: term, flags: ["I"] };

      const searchFilter = {
        or: [
          { description: regex },
          { category: { name: regex } },
          { department: { name: regex } }
        ]
      };

      if (!baseWhere.and) {
        baseWhere.and = [];
      }
      baseWhere.and.push(searchFilter);
    }

    return baseWhere;
  }, [debouncedFilters]);

  const [result, reexecuteQuery] = useQuery({
    query: GET_ENTRIES_BY_DEPARTMENT,
    variables: {
      where,
      limit: paginationModel.pageSize,
      offset: paginationModel.page * paginationModel.pageSize
    },
    pause: !debouncedFilters.fiscalYearId,
    requestPolicy: 'cache-and-network',
  });

  const refresh = () => {
    reexecuteQuery({ requestPolicy: 'network-only' });
  };

  return {
    entries: result.data?.entries || [],
    totalCount: result.data?.entriesCount || 0,
    fetching: result.fetching,
    error: result.error,
    refresh,
    stale: result.stale,
  };
}
