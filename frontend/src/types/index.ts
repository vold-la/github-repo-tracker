export interface ReleaseMetadata {
  htmlUrl: string;
  tarballUrl?: string | null;
  zipballUrl?: string | null;
  draft: boolean;
  prerelease: boolean;
}

export interface Release {
  id: string;
  version: string;
  name: string;
  description?: string;
  releaseDate: string;
  githubId: string;
  seen: boolean;
  repository: Repository;
  createdAt: string;
  updatedAt: string;
  metadata?: ReleaseMetadata;
}

export interface Repository {
  id: string;
  name: string;
  owner: string;
  description?: string;
  fullName: string;
  githubId: number;
  latestRelease?: Release;
  releases: Release[];
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}
