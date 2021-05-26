import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";

const LIMIT = 3;

const SOME_PEOPLE = gql`
  query SomePeople($order: String!, $limit: Int!, $page: Int!, $explode: Boolean) {
    people(order: $order, limit: $limit, page: $page, explode: $explode) {
      id
      name
    }
  }
`;

export default function App() {
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState('asc');
  const [explode, setExplode] = useState(false);

  const {
    loading,
    data,
    refetch,
    fetchMore,
  } = useQuery(SOME_PEOPLE, {
    variables: {
      limit: LIMIT,
      page,
      order,
      explode,
    },
  });

  const addPage = () => {
    const nextPage = page + 1;

    fetchMore({
      variables: {
        limit: LIMIT,
        page: nextPage,
        order,
        explode,
      },
      updateQuery: (previousResults, { fetchMoreResult }) => {
        console.log("updateQuery called with previousResults: ", previousResults);

        if (!fetchMoreResult || !Array.isArray(fetchMoreResult.people)) {
          return previousResults;
        }

        return {
          ...fetchMoreResult,
          people: previousResults.people.concat(fetchMoreResult.people)
        };
      }
    })
    .then(() => {
      setPage(nextPage);
    })
    .catch(error => {
      console.log("Pagination failed with error:", error);
    });
  };

  const handleSort = e => {
    const nextOrder = e.target.checked ? "asc" : "desc";
    const prevOrder = order;
    if (prevOrder === nextOrder) {
      return;
    }
    refetch({
      limit: LIMIT,
      page: 1,
      order: nextOrder,
      explode,
    }).then(() => {
      setPage(1);
      setOrder(nextOrder);
    }).catch(() => {
      console.log("Sort failed");
    });
  };

  return (
    <main>
      <h1>Apollo Client Issue Reproduction</h1>
      <div>
        <label>
          <input type="checkbox" checked={explode} onChange={() => setExplode(!explode)} /> Offline?
          <span role="img" aria-label="boom">💥</span>
        </label>
      </div>
      <h2>Names</h2>
      {loading ? (
        <p>Loading…</p>
      ) : (
          <ul>
            {data && data.people && data.people.map(person => (
              <li key={person.id}>{person.name}</li>
            ))}
            <li><button onClick={addPage}>Load more</button></li>
          </ul>
        )}
      <div><label><input type="checkbox" checked={order === "asc"} onChange={handleSort} /> Sort in ascending order</label></div>
    </main>
  )
};
