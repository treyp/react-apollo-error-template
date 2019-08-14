import React from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { isArray, flowRight as compose } from "lodash";

const queryVariables = state => ({
  limit: 3,
  page: (state && state.page) || 1,
  order: (state && state.order) || "asc",
  explode: (state && state.explode) || false
});

class People extends React.PureComponent {
  state = {
    page: 1,
    order: "asc",
    explode: false
  };

  handleExplode = e => {
    if (e.target.checked !== this.state.explode) {
      this.setState({ explode: !!e.target.checked });
    }
  }

  handleSort = e => {
    const nextOrder = e.target.checked ? "asc" : "desc";
    const prevOrder = this.state.order;
    if (prevOrder === nextOrder) {
      return;
    }
    this.props.people.refetch(
      queryVariables({ ...this.state, order: nextOrder, page: 1 })
    ).then(() => {
      this.setState({ order: nextOrder, page: 1 });
    }).catch(() => {
      console.log("Sort failed");
    });
  };

  addPage = () => {
    const nextPage = this.state.page + 1;

    this.props.people.fetchMore({
      variables: queryVariables({ ...this.state, page: nextPage }),
      updateQuery: (previousResults, { fetchMoreResult }) => {
        console.log("updateQuery called with previousResults: ", previousResults);

        if (!fetchMoreResult || !isArray(fetchMoreResult.people)) {
          return previousResults;
        }

        return {
          ...fetchMoreResult,
          people: previousResults.people.concat(fetchMoreResult.people)
        };
      }
    })
    .then(() => {
      this.setState({
        page: nextPage
      });
    })
    .catch(error => {
      console.log("Pagination failed with error:", error);
    });
  };

  render() {
    console.log("Component rendering with data:", this.props.people);
    // console.log("State during render:", this.state);

    const {
      loading,
      people
    } = this.props.people;

    return (
      <main>
        <h1>Apollo Client Issue Reproduction</h1>
        <div>
          <label>
            <input type="checkbox" checked={this.state.explode} onChange={this.handleExplode} /> Offline?
            <span role="img" aria-label="boom">💥</span>
          </label>
        </div>
        <h2>Names</h2>
        {loading ? (
          <p>Loading…</p>
        ) : (
            <ul>
              {people.map(person => (
                <li key={person.id}>{person.name}</li>
              ))}
              <li><button onClick={this.addPage}>Load more</button></li>
            </ul>
          )}
        <div><label><input type="checkbox" checked={this.state.order === "asc"} onChange={this.handleSort} /> Sort in ascending order</label></div>
      </main>
    );
  }
}

const PeopleWithData = compose(
  graphql(
    gql`
      query SomePeople($order: String!, $limit: Int!, $page: Int!, $explode: Boolean) {
        people(order: $order, limit: $limit, page: $page, explode: $explode) {
          id
          name
        }
      }
    `,
    {
      name: "people",
      options: props => ({ variables: queryVariables() })
    }
  )
)(People);

export default PeopleWithData;
