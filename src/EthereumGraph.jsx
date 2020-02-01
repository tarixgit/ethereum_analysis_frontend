import React, {useState} from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Deposits from "./Deposits";
import Orders from "./Orders";

const TRANSACTION = gql`
query Address(address: String!) {
  labels() {
    id
    name
    color
  }
}

`;

const EthereumGraph = (classes) => {
  const [address, setAddress] = useState("")
  const { loading, error, data } = useQuery(TRANSACTION, {variables: {address}});

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return <Grid container spacing={3}>
    <Grid item xs={12}>
      <Paper className={classes.paper}>
        <TextField
          id="address-input"
          label="Address"
          autoFocus
          fullWidth
          value={address}
          onChange={setAddress}
        />
      </Paper>
    </Grid>
    <Grid item xs={12}>
      <Paper className={classes.paper}>
      </Paper>
    </Grid>

  </Grid>
}

export default EthereumGraph