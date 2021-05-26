import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
} from 'graphql';

const PersonType = new GraphQLObjectType({
  name: 'Person',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
  },
});

const peopleData = [];
for (let pdIndex = 0; pdIndex < 26; pdIndex++) {
  peopleData.push({id: pdIndex, name: String.fromCharCode("A".charCodeAt(0) + pdIndex)})
}

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    people: {
      type: new GraphQLList(PersonType),
      args: {
        order: {type: GraphQLString},
        limit: {type: GraphQLInt},
        page: {type: GraphQLInt},
        explode: {type: GraphQLBoolean}
      },
      resolve: (_, args) => {
        if (args.explode) {
          throw new Error("Server \"down!\"");
        }
        const start = (args.page - 1) * args.limit;
        const end = start + args.limit;
        return [...peopleData].sort((a, b) => {
          if (a.name === b.name) {
            return 0;
          }
          if (a.name > b.name) {
            return args.order === "asc" ? 1 : -1;
          }
          return args.order === "asc" ? -1 : 1;
        }).slice(start, end);
      }
    },
  },
});

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addPerson: {
      type: PersonType,
      args: {
        name: { type: GraphQLString },
      },
      resolve: function (_, { name }) {
        const person = {
          id: peopleData[peopleData.length - 1].id + 1,
          name,
        };

        peopleData.push(person);
        return person;
      }
    },
  },
});

export const schema = new GraphQLSchema({ query: QueryType, mutation: MutationType });
