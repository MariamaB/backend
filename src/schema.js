const typeDefs = `

input BMInput {
	id: String!
	name: String!
	keyPartners: String
	keyActivities: String
	valueProposition: String
	customerRelationships: String
	customerSegments: String
	keyResources: String
	channels: String
	costStructure: String
	revenueStreams: String
}

type BusinessModel {
	id: ID!
	name: String!
	keyPartners: String
	keyActivities: String
	valueProposition: String
	customerRelationships: String
	customerSegments: String
	keyResources: String
	channels: String
	costStructure: String
	revenueStreams: String
}

type Query {
	businessModels: [BusinessModel]
	businessModelsWith(searchString: String!): [BusinessModel]
	businessModel(id: ID!): BusinessModel
}

type Mutation {
	createBusinessModel(name: String!): BusinessModel!
	editBusinessModel(businessModel: BMInput): BusinessModel!
	deleteBusinessModel(id: ID!): BusinessModel
}

type Subscription {
	businessModelOnEdit: BusinessModel!
	newBusinessModel: BusinessModel
	deletedBusinessModel: BusinessModel!
}
`;

module.exports = typeDefs;

// editBusinessModel(id: ID!, name: String, 
// 	keyPartners: String, 
// 	keyActivities: String, 
// 	valueProposition: String, 
// 	customerRelationships: String, 
// 	customerSegments: String, 
// 	keyResources: String, 
// 	channels: String, 
// 	costStructure: String, 
// 	revenueStreams: String): BusinessModel!