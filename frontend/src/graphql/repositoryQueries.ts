import { gql } from '@apollo/client';

export const GET_REPOSITORIES = gql`
  query GetRepositories {
    repositories {
      id
      name
      owner
      description
      fullName
      githubId
      latestRelease {
        id
        version
        name
        description
        releaseDate
        githubId
        seen
        metadata {
          htmlUrl
          tarballUrl
          zipballUrl
          draft
          prerelease
        }
      }
      releases {
        id
        version
        name
        description
        releaseDate
        githubId
        seen
        metadata {
          htmlUrl
          tarballUrl
          zipballUrl
          draft
          prerelease
        }
      }
      createdAt
      updatedAt
      isArchived
    }
  }
`;

export const MARK_RELEASE_AS_SEEN = gql`
  mutation MarkReleaseAsSeen($releaseId: ID!, $seen: Boolean!) {
    markReleaseAsSeen(releaseId: $releaseId, seen: $seen) {
      id
      version
      name
      description
      releaseDate
      githubId
      seen
      metadata {
        htmlUrl
        tarballUrl
        zipballUrl
        draft
        prerelease
      }
    }
  }
`;

export const REMOVE_REPOSITORY = gql`
  mutation RemoveRepository($id: ID!) {
    removeRepository(id: $id)
  }
`;

export const ADD_REPOSITORY = gql`
  mutation AddRepository($url: String!) {
    addRepository(url: $url) {
      id
      name
      owner
      description
      fullName
      githubId
      latestRelease {
        id
        version
        name
        description
        releaseDate
        githubId
        seen
        metadata {
          htmlUrl
          tarballUrl
          zipballUrl
          draft
          prerelease
        }
      }
      createdAt
      updatedAt
      isArchived
    }
  }
`;

export const REFRESH_REPOSITORY = gql`
  mutation RefreshRepository($id: ID!) {
    refreshRepository(id: $id) {
      id
      name
      owner
      description
      fullName
      githubId
      latestRelease {
        id
        version
        name
        description
        releaseDate
        githubId
        seen
        metadata {
          htmlUrl
          tarballUrl
          zipballUrl
          draft
          prerelease
        }
      }
      releases {
        id
        version
        name
        description
        releaseDate
        githubId
        seen
        metadata {
          htmlUrl
          tarballUrl
          zipballUrl
          draft
          prerelease
        }
      }
      createdAt
      updatedAt
      isArchived
    }
  }
`;
