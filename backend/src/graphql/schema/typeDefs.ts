export const typeDefs = `#graphql
  type Repository {
    id: ID!
    name: String!
    owner: String!
    description: String
    fullName: String!
    githubId: Int!
    latestRelease: Release
    releases: [Release!]!
    createdAt: String!
    updatedAt: String!
    isArchived: Boolean!
  }

  type Release {
    id: ID!
    version: String!
    name: String!
    description: String
    releaseDate: String!
    githubId: String!
    seen: Boolean!
    repository: Repository!
    createdAt: String!
    updatedAt: String!
    metadata: ReleaseMetadata
  }

  type ReleaseMetadata {
    htmlUrl: String!
    tarballUrl: String
    zipballUrl: String
    draft: Boolean!
    prerelease: Boolean!
  }

  type Query {
    repositories: [Repository!]!
    repository(id: ID!): Repository
    releases(repositoryId: ID!): [Release!]!
    release(id: ID!): Release
  }

  type Mutation {
    addRepository(url: String!): Repository!
    removeRepository(id: ID!): Boolean!
    markReleaseAsSeen(releaseId: ID!, seen: Boolean!): Release!
    refreshRepository(id: ID!): Repository!
  }
`;
