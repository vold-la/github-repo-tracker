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

      const { data: repoData } = await this.octokit.repos.get({
        owner,
        repo,
      });

      const existingRepo = await this.dataSource.manager.findOne(Repository, {
        where: { githubId: repoData.id },
        relations: ['releases'],
      });

      if (existingRepo) {
        throw new Error(`Repository ${owner}/${repo} is already in your watch list`);
      }

      const repository = new Repository();
      repository.name = repoData.name;
      repository.owner = repoData.owner.login;
      repository.description = repoData.description || '';
      repository.fullName = repoData.full_name;
      repository.githubId = repoData.id;
      repository.isArchived = repoData.archived;

      await this.dataSource.manager.save(repository);

      await this.fetchAndSaveReleases(repository);

      return await this.dataSource.manager.findOne(Repository, {
        where: { id: repository.id },
        relations: ['releases'],
      }) as Repository;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to add repository');
    }
  }

  async fetchAndSaveReleases(repository: Repository): Promise<void> {
    try {
      const { data: releases } = await this.octokit.repos.listReleases({
        owner: repository.owner,
        repo: repository.name,
      });

      for (const releaseData of releases) {
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

        await this.dataSource.manager.save(release);
      }
    } catch (error) {
      console.error('Error fetching releases:', error);
      throw new Error('Failed to fetch repository releases');
    }
  }

  async refreshRepository(repository: Repository): Promise<Repository> {
    try {
      const { data: repoData } = await this.octokit.repos.get({
        owner: repository.owner,
        repo: repository.name,
      });

      repository.description = repoData.description || '';
      repository.isArchived = repoData.archived;
      await this.dataSource.manager.save(repository);

      const { data: releases } = await this.octokit.repos.listReleases({
        owner: repository.owner,
        repo: repository.name,
      });

      for (const releaseData of releases) {
        const existingRelease = await this.dataSource.manager.findOne(Release, {
          where: { githubId: releaseData.id.toString() },
        });

        if (!existingRelease) {
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

          await this.dataSource.manager.save(release);
        }
      }

      return repository;
    } catch (error) {
      console.error('Error refreshing repository:', error);
      throw new Error('Failed to refresh repository');
    }
  }
}
