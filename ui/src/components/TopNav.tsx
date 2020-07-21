import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import { Link } from "react-router-dom";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import { DeptsForNav_1Query as DeptsForNavQuery } from "../apollo/graphTypes";

const DEPTS_FOR_NAV = gql`
  query DeptsForNav_1 {
    departments {
      __typename
      id
      name
      parent {
        __typename
        ... on Business {
          id
        }
        ... on Department {
          id
        }
      }
      virtualRoot
    }
  }
`;

const TopNav = function (props: Record<string, unknown>) {
  const { loading, error, data } = useQuery<DeptsForNavQuery>(DEPTS_FOR_NAV);

  const [value, setValue] = useState<string | null>(null);

  const depts = data?.departments || [];

  type Department = typeof depts[0];

  const { rootDepts, virtualRoots } = useMemo(() => {
    const rootDepts: Department[] = [];
    const virtualRoots = new Set<string>();

    for (const dept of depts) {
      if (dept.parent.__typename === "Business") {
        rootDepts.push(dept);
      }

      if (dept.virtualRoot) {
        virtualRoots.add(dept.id);
      }
    }

    return { rootDepts, virtualRoots };
  }, [depts]);

  const subDepts = useMemo(() => {
    const subDepts: Department[] = [];

    if (value && virtualRoots.has(value)) {
      for (const dept of depts) {
        if (dept.parent.id === value) {
          subDepts.push(dept);
        }
      }
    }

    return subDepts;
  }, [virtualRoots, value, depts]);

  useEffect(() => {
    document.title = "Select Department";
  });

  const onChange = useCallback(
    (event?) => {
      setValue(event?.target?.value || null);
    },
    [setValue]
  );

  if (loading) {
    return <p>Loading...</p>;
  } else if (error) {
    return <p>{error.message}</p>;
  }

  const showSubDepts = subDepts.length > 0;

  return (
    <Box
      flexGrow={1}
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      clone
    >
      <Container>
        <Box padding={4} clone>
          <Typography align="center" color="primary" variant="h3">
            Select Department
          </Typography>
        </Box>
        <Box minWidth="250px !important" clone>
          <FormControl variant="filled">
            <InputLabel>Department</InputLabel>
            <Select value={value} onChange={onChange} autoWidth>
              {rootDepts.map((dept) => {
                const props = {
                  component: Link,
                  to: `/department/${dept.id}`,
                  value: dept.id,
                  children: dept.name,
                };

                if (dept.virtualRoot) {
                  delete props.component;
                  delete props.to;
                }

                return <MenuItem key={dept.id} {...props} />;
              })}
            </Select>
          </FormControl>
        </Box>
        {showSubDepts && (
          <Box pt={2}>
            <Box pt={2} minWidth="250px !important" clone>
              <FormControl variant="filled">
                <InputLabel>Sub Department</InputLabel>
                <Select autoWidth>
                  {subDepts.map((dept) => {
                    const props = {
                      component: Link,
                      to: `/department/${dept.id}`,
                      value: dept.id,
                      children: dept.name,
                    };

                    return <MenuItem key={dept.id} {...props} />;
                  })}
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default TopNav;
