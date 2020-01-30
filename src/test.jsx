import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

const EXCHANGE_RATES = gql`
query MyQuery {
  labels {
    id
    name
    color
  }
}

`;

const Test = () => {
  const { loading, error, data } = useQuery(EXCHANGE_RATES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return data.labels.map(({ id, name,  color}) => (
    <div key={id}>
      <p>
        {name}: {color}
      </p>
    </div>
  ));
}

export default Test