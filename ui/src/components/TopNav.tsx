import React, {useCallback, useEffect} from "react";
import {useQuery} from "@apollo/react-hooks";
import gql from "graphql-tag";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import {Link} from "react-router-dom";
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import {DeptsForNav_1Query as DeptsForNavQuery} from "../apollo/graphTypes";

const DEPTS_FOR_NAV = gql`
  query DeptsForNav_1 {
    departments {
      __typename
      id
      name
      parent {
        __typename
      }
    }
  }
`;

const TopNav = function(props) {

  const {loading, error, data} = useQuery<DeptsForNavQuery>(DEPTS_FOR_NAV);

  useEffect(() => { document.title = "Select Department"; });

  if(loading) {
    return <p>Loading...</p>;
  } else if(error) {
    return <p>{error.message}</p>;
  }

  const depts = (data?.departments || []).filter((dept)=> 
    dept?.parent.__typename === "Business");

  return <Box
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
          <Select autoWidth>{depts.map((dept)=>{
            const props = {
              component:Link,
              to:`/department/${dept.id}`,
              key:dept.id,
              value:dept.id,
              selected:false,
              children:dept.name
            }  as any;
            return <MenuItem {...props}/>
          })}</Select>
        </FormControl>
      </Box>
    </Container>
   </Box>;

}

export default TopNav;