// const businessModels = require('./database');
const { neo4jgraphql } = require('neo4j-graphql-js');
// const businessModels = neo4jgraphql;
const { PubSub, withFilter } = require('graphql-subscriptions');
// import { neo4jgraphql } from 'neo4j-graphql';
const uuidv1 = require('uuid/v1');

let businessModels = neo4jgraphql;

const NEW_BUSINESS_MODEL = 'NEW_BUSINESS_MODEL';
const DELETED_BUSINESS_MODEL = 'DELETED_BUSINESS_MODEL';
const BUSINESS_MODEL_ON_EDIT = 'BUSINESS_MODEL_ON_EDIT';



const resolvers = {
    Query: {
        businessModels: (parent, args, context, info) => {
            return neo4jgraphql(parent, args, context, info);
        },
        businessModelsWith: async(parent, { searchString }, context, info) => {
            const session = context.driver.session();
            let businessModelList = [];
            try {
                const businessModels = await session.run(`Match (bm:BusinessModel) Return bm`);

                businessModelList = await businessModels.records.map(record => {
                    return record.get("bm").properties;
                });

            } catch (e) {
                console.error(e);
            } finally {
                await session.close();
            }

            console.log('bm', JSON.stringify(businessModelList, null, 2))
            businessModelList = businessModelList.filter(
                (bM) => bM.name.includes(searchString) || bM.keyPartners.includes(searchString) || bM.keyActivities.includes(searchString) ||
                bM.valueProposition.includes(searchString) || bM.customerRelationships.includes(searchString) ||
                bM.customerSegments.includes(searchString) || bM.keyResources.includes(searchString) || bM.channels.includes(searchString) ||
                bM.costStructure.includes(searchString) || bM.revenueStreams.includes(searchString));

            return businessModelList.size() > 0 ? businessModelList : error('No such Business Model Canvas!');

        },
        businessModel: async(parent, { id }, context, info) => {
            const session = context.driver.session();
            let businessModel;
            try {
                const businessModels = await session.run(`Match (bm:BusinessModel {id: $id}) Return bm`, { id });
                [businessModel] = await businessModels.records.map(record => {
                    return record.get("bm").properties;
                });

            } catch (e) {
                console.error(e);
            } finally {
                await session.close();
            }
            return businessModel;
        }
    },
    Mutation: {
        createBusinessModel: async(parent, { name }, { driver, pubsub }, info) => {
            const session = driver.session();
            let businessModel;
            try {
                const newBusinessModel = await session.run(`CREATE (newBm:BusinessModel { id: $id, name: $name, keyPartners: "", keyActivities: "", valueProposition: "", customerRelationships: "", customerSegments: "", keyResources: "", channels: "", costStructure: "", revenueStreams: ""}) RETURN newBm`, { id: uuidv1(), name });
                [businessModel] = await newBusinessModel.records.map(record => {
                    return record.get("newBm").properties;
                });
                pubsub.publish(NEW_BUSINESS_MODEL, {
                    newBusinessModel: businessModel
                });
            } catch (e) {
                console.error(e);
            } finally {
                await session.close();
            }
            return businessModel;
        },

        editBusinessModel: async(parent, { businessModel }, { driver, pubsub }) => {
            const session = driver.session();
            let updatedBusinessModel;
            try {
                const updatedBM = await session.run(
                    `
                    MATCH (bm:BusinessModel{id: $businessModel.id})
                    SET bm = $businessModel
                    RETURN bm
                `, { businessModel }
                );
                [updatedBusinessModel] = await updatedBM.records.map(record => {
                    return record.get("bm").properties;
                });

                pubsub.publish(BUSINESS_MODEL_ON_EDIT, {
                    businessModelOnEdit: businessModel
                });
            } catch (e) {
                console.error(e);
            } finally {
                await session.close();
            }
            return updatedBusinessModel;
        },
        deleteBusinessModel: async(parent, { id }, { pubsub, driver }, info) => {
            let businessModel;
            const session = driver.session();
            try {
                const checkBM = await session.run(`MATCH (bm:BusinessModel {id: $id}) RETURN bm`, { id });
                [businessModel] = await checkBM.records.map(record => {
                    return record.get("bm").properties;
                });
                if (businessModel) {
                    await session.run(`MATCH (deletedBM:BusinessModel {id: $id}) DELETE deletedBM`, { id });
                    pubsub.publish(DELETED_BUSINESS_MODEL, {
                        deletedBusinessModel: businessModel
                    });
                } else {
                    businessModel = undefined;
                }
            } catch (e) {
                console.error(e);
            } finally {
                await session.close();
            }
            return businessModel;
        }
    },

    Subscription: {
        newBusinessModel: {
            subscribe: withFilter(
                (_, args, { pubsub }) => {
                    console.log('REGISTER TOPIC businessModelAdded')
                    return pubsub.asyncIterator([NEW_BUSINESS_MODEL])
                },
                (payload, variables) => {
                    console.log(`Check if filter satisfied ${payload} ${variables}`)
                    return true
                }
            )
        },
        businessModelOnEdit: {
            subscribe: (parent, args, { pubsub }) => {
                try {
                    pubsub.asyncIterator(BUSINESS_MODEL_ON_EDIT).then(() => {})
                } catch (e) {
                    console.log("businessModelOnEdit catch block")
                }
            }
        },
        deletedBusinessModel: {
            subscribe: (parent, args, { pubsub }) => {
                try {
                    pubsub.asyncIterator(DELETED_BUSINESS_MODEL).then(() => {})
                } catch (e) {
                    console.log("deletedBusinessModel catch block")
                }
            }
        }
    }
};


module.exports = resolvers;