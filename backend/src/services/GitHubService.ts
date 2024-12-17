import { Octokit } from '@octokit/rest';
import { Repository } from '../models/Repository';
import { Release } from '../models/Release';
import { DataSource } from 'typeorm';

export class GitHubService {
  private octokit: Octokit;
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN env is required');
    }
    
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    this.dataSource = dataSource;
  }

  async parseRepositoryUrl(url: string): Promise<{ owner: string; repo: string }> {
    const githubUrlRegex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(githubUrlRegex);

    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }

    const [, owner, repo] = match;
    if (!owner || !repo) {
      throw new Error('Invalid GitHub repository URL format');
    }

    return { owner, repo: repo.replace(/\.git$/, '') };
  }

  async addRepository(url: string): Promise<Repository> {
    try {
      const { owner, repo } = await this.parseRepositoryUrl(url);

      const { data: repoData } = await this.octokit.repos.get({ owner, repo });

      const existingRepo = await this.dataSource.manager.findOne(Repository, {
        where: { githubId: repoData.id },
        relations: ['releases'],
      });

      if (existingRepo) {
        throw new Error(`Repository ${owner}/${repo} is already in your watch list`);
      }

      return await this.dataSource.transaction(async transactionalEntityManager => {
        const repository = new Repository();
        repository.name = repoData.name;
        repository.owner = repoData.owner.login;
        repository.description = repoData.description || '';
        repository.fullName = repoData.full_name;
        repository.githubId = repoData.id;
        repository.isArchived = repoData.archived;

        const savedRepo = await transactionalEntityManager.save(repository);
        await this.fetchAndSaveReleases(savedRepo, transactionalEntityManager);

        return await transactionalEntityManager.findOne(Repository, {
          where: { id: savedRepo.id },
          relations: ['releases'],
        }) as Repository;
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to add repository');
    }
  }

  async fetchAndSaveReleases(
    repository: Repository,
    transactionalEntityManager?: typeof this.dataSource.manager
  ): Promise<void> {
    try {
      interface ReleaseResponse {
        data: Array<{
          id: number;
          tag_name: string;
          name: string | null;
          body: string | null;
          published_at: string | null;
          created_at: string;
          html_url: string;
          tarball_url: string | null;
          zipball_url: string | null;
          draft: boolean;
          prerelease: boolean;
        }>;
      }

      const response = await this.octokit.repos.listReleases({
        owner: repository.owner,
        repo: repository.name,
      }) as ReleaseResponse;

      if (response.data.length === 0) return;

      const releasesToSave = response.data.map(releaseData => {
        const release = new Release();
        release.version = releaseData.tag_name;
        release.name = releaseData.name || releaseData.tag_name;
        release.description = releaseData.body || '';
        release.releaseDate = new Date(releaseData.published_at || releaseData.created_at);
        release.githubId = releaseData.id.toString();
        release.repository = repository;
        release.metadata = {
          htmlUrl: releaseData.html_url,
          tarballUrl: releaseData.tarball_url || null,
          zipballUrl: releaseData.zipball_url || null,
          draft: releaseData.draft,
          prerelease: releaseData.prerelease,
        };
        return release;
      });

      const manager = transactionalEntityManager || this.dataSource.manager;
      await manager.save(Release, releasesToSave);
    } catch (error) {
      console.error('Error fetching releases:', error);
      throw new Error('Failed to fetch repository releases');
    }
  }

  async refreshRepository(repository: Repository): Promise<Repository> {
    try {
      return await this.dataSource.transaction(async transactionalEntityManager => {
        interface RepoResponse {
          data: {
            description: string | null;
            archived: boolean;
          };
        }

        interface ReleaseResponse {
          data: Array<{
            id: number;
            tag_name: string;
            name: string | null;
            body: string | null;
            published_at: string | null;
            created_at: string;
            html_url: string;
            tarball_url: string | null;
            zipball_url: string | null;
            draft: boolean;
            prerelease: boolean;
          }>;
        }

        const [repoResponse, releasesResponse, existingReleases] = await Promise.all([
          this.octokit.repos.get({
            owner: repository.owner,
            repo: repository.name,
          }) as Promise<RepoResponse>,
          this.octokit.repos.listReleases({
            owner: repository.owner,
            repo: repository.name,
          }) as Promise<ReleaseResponse>,
          transactionalEntityManager.find(Release, {
            where: { repository: { id: repository.id } },
          })
        ]);

        repository.description = repoResponse.data.description || '';
        repository.isArchived = repoResponse.data.archived;
        
        const releasesToSave = releasesResponse.data.map(releaseData => {
          const existingRelease = existingReleases.find(
            r => r.githubId === releaseData.id.toString()
          );

          const release = existingRelease || new Release();
          release.version = releaseData.tag_name;
          release.name = releaseData.name || releaseData.tag_name;
          release.description = releaseData.body || '';
          release.releaseDate = new Date(releaseData.published_at || releaseData.created_at);
          release.githubId = releaseData.id.toString();
          release.repository = repository;
          release.metadata = {
            htmlUrl: releaseData.html_url,
            tarballUrl: releaseData.tarball_url || null,
            zipballUrl: releaseData.zipball_url || null,
            draft: releaseData.draft,
            prerelease: releaseData.prerelease,
          };
          return release;
        });

        const currentGithubReleaseIds = releasesResponse.data.map(r => r.id.toString());
        const releasesToRemove = existingReleases.filter(
          r => !currentGithubReleaseIds.includes(r.githubId)
        );

        await Promise.all([
          transactionalEntityManager.save(repository),
          releasesToSave.length > 0 ? transactionalEntityManager.save(Release, releasesToSave) : Promise.resolve(),
          releasesToRemove.length > 0 ? transactionalEntityManager.remove(releasesToRemove) : Promise.resolve()
        ]);

        return await transactionalEntityManager.findOne(Repository, {
          where: { id: repository.id },
          relations: ['releases'],
        }) as Repository;
      });
    } catch (error) {
      console.error('Error refreshing repository:', error);
      throw new Error('Failed to refresh repository');
    }
  }
}
