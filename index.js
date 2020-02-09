const { ApolloServer } = require('apollo-server');
const { NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD } = require('./config/config');
const neo4j = require('neo4j-driver');
// const { NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD } = requiredConfigs;
// const { makeExecutableSchema } = require('graphql-tools');
const typeDefs = require('./schema');
const { makeAugmentedSchema } = require('neo4j-graphql-js');
const resolvers = require('./resolvers')

const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

let driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
);

const schema = makeAugmentedSchema({ typeDefs, resolvers })

const server = new ApolloServer({
    schema,
    context: ({ req }) => {
        const token = req ? req.headers.authorization : "Subscription";
        return {
            // user: decode(token),
            user: token,
            driver,
            pubsub
        };
    },
    introspection: true,
    playground: true,
});
const port = 4000;
// The `listen` method launches a web server.
server.listen({ port }).then(({ url }) => {
    // eslint-disable-next-line no-console
    console.log(`🚀  Server ready at ${url}`);
});

module.exports = driver;