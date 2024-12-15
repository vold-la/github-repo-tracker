import { Repository } from '../../models/Repository';
import { Release } from '../../models/Release';
import { GitHubService } from '../../services/GitHubService';
import { DataSource } from 'typeorm';

export const createResolvers = (dataSource: DataSource, githubService: GitHubService) => ({
  Query: {
    repositories: async () => {
      return await dataSource.manager.find(Repository, {
        relations: ['releases'],
        order: {
          updatedAt: 'DESC',
        },
      });
    },

    repository: async (_: any, { id }: { id: string }) => {
      return await dataSource.manager.findOne(Repository, {
        where: { id },
        relations: ['releases'],
      });
    },

    releases: async (_: any, { repositoryId }: { repositoryId: string }) => {
      return await dataSource.manager.find(Release, {
        where: { repository: { id: repositoryId } },
        order: {
          releaseDate: 'DESC',
        },
      });
    },

    release: async (_: any, { id }: { id: string }) => {
      return await dataSource.manager.findOne(Release, {
        where: { id },
        relations: ['repository'],
      });
    },
  },

  Mutation: {
    addRepository: async (_: any, { url }: { url: string }) => {
      return await githubService.addRepository(url);
    },

    removeRepository: async (_: any, { id }: { id: string }) => {
      const repository = await dataSource.manager.findOne(Repository, {
        where: { id },
      });

      if (!repository) {
        throw new Error('Repository not found');
      }

      await dataSource.manager.remove(repository);
      return true;
    },

    markReleaseAsSeen: async (_: any, { releaseId, seen }: { releaseId: string; seen: boolean }) => {
      const release = await dataSource.manager.findOne(Release, {
        where: { id: releaseId },
        relations: ['repository'],
      });

      if (!release) {
        throw new Error('Release not found');
      }

      release.seen = seen;
      await dataSource.manager.save(release);
      return release;
    },

    refreshRepository: async (_: any, { id }: { id: string }) => {
      const repository = await dataSource.manager.findOne(Repository, {
        where: { id },
        relations: ['releases'],
      });

      if (!repository) {
        throw new Error('Repository not found');
      }

      return await githubService.refreshRepository(repository);
    },
  },

  Repository: {
    latestRelease: (repository: Repository) => {
      return repository.getLatestRelease();
    },
  },
});
