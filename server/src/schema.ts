export const typeDefs = /* GraphQL */ `
	type Message {
		id: ID!
		content: String!
		role: Role!
		timestamp: String!
	}

	enum Role {
		user
		ai
	}
	type Query {
		chatHistory(limit: Int = 50, sessionId: String): [Message!]!
		message(id: ID!): Message
	}

	type Mutation {
		sendMessage(message: String!, sessionId: String): Message!
		clearChat(sessionId: String): Boolean!
	}

	type Subscription {
		messageAdded(sessionId: String): Message!
	}
`;
