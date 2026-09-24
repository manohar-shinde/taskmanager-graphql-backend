export const typeDefs = `

	  type User {
		id : ID!
		name : String!
		email : String!
		tasks : [Task!]!
	  }
	
	  input CreateUserInput {
		id: ID!
		name: String!
		email: String!
		password: String!
	  }
	  
	  type Task {
		id : ID!
		title : String!
		completed : Boolean!
		userId : ID!
		user : User
	  }
	
	  type Subscription {
	 	taskCreated: Task! 
	  }
	  
	  type TaskPage {
		tasks : [Task!]!
		total: Int!
	  }
	
	  type AuthPayload {
		token: String!
		user: User!
	  }
	  
	  input CreateTaskInput {
		title : String!
	  }

	  input UpdateTaskInput {
		title : String
		completed : Boolean
	  }

	  type Query {
		users : [User!]!
		user (id: ID!) : User
		tasks (page: Int = 1, limit: Int = 10, completed: Boolean): TaskPage!
		task (id: ID!) : Task
		me : User
	  }
	  
	  type Mutation {
		login(email:String!, password:String!) : AuthPayload!
		changePassword (currentPassword: String!, newPassword: String!) : Boolean!
		createUser(input: CreateUserInput) : User!
		deleteAccount : Boolean!
		createTask(input: CreateTaskInput) : Task!
		updateTask(id: ID!, input: UpdateTaskInput) : Task!
		deleteTask(id: ID!) : Task!
	  }
	`;
