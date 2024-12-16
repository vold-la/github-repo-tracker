import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  Menu,
  useTheme,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, gql } from '@apollo/client';
import GitHubIcon from '@mui/icons-material/GitHub';
import type { Components } from 'react-markdown';
import { Release, Repository } from '../../types';
import {
  ADD_REPOSITORY,
  GET_REPOSITORIES,
  MARK_RELEASE_AS_SEEN,
  REMOVE_REPOSITORY,
  REFRESH_REPOSITORY,
} from '../../graphql/repositoryQueries';
import {
  Container,
  Header,
  ContentContainer,
  LeftPanel,
  RightPanel,
  StyledListItemButton,
  VersionChip,
  HighlightedText,
  AddButton,
  StyledIconButton,
  ReleaseHistoryButton,
  StyledTextField,
} from './styles';
import { FilterOption, SnackbarState, SortDirection, SortOption } from './types';
import { formatDate } from '../../utils';
import ReleaseDetails from './ReleaseDetails';
import ActionButtons from './ActionButtons';

const highlightText = (text: string, query: string) => {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) => (
    <HighlightedText key={i} highlight={part.toLowerCase() === query.toLowerCase()}>
      {part}
    </HighlightedText>
  ));
};

const RepositoryList: React.FC = () => {
  const theme = useTheme();
  const [repoUrl, setRepoUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [releaseHistoryAnchorEl, setReleaseHistoryAnchorEl] = useState<HTMLElement | null>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { loading, error, data } = useQuery<{ repositories: Repository[] }>(GET_REPOSITORIES);
  const [markAsSeen] = useMutation(MARK_RELEASE_AS_SEEN);
  const [deleteRepository] = useMutation(REMOVE_REPOSITORY);
  const [addRepository] = useMutation(ADD_REPOSITORY);
  const [refreshRepository] = useMutation(REFRESH_REPOSITORY);

  const repoInputRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        repoInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleAddRepository = async () => {
    if (!repoUrl) return;

    try {
      const result = await addRepository({
        variables: { url: repoUrl },
        refetchQueries: [{ query: GET_REPOSITORIES }],
      });

      setRepoUrl('');

      if (result.data?.addRepository) {
        handleRepositorySelect(result.data.addRepository);
        setSnackbar({
          open: true,
          message: 'Repository added successfully',
          severity: 'success',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error adding repository';

      if (data?.repositories && errorMessage.includes('already in your watch list')) {
        const urlParts = repoUrl.split('/');
        const repoName = urlParts[urlParts.length - 1];
        const ownerName = urlParts[urlParts.length - 2];

        const existingRepo = data.repositories.find(
          repo =>
            repo.owner.toLowerCase() === ownerName.toLowerCase() &&
            repo.name.toLowerCase() === repoName.toLowerCase()
        );

        if (existingRepo) {
          handleRepositorySelect(existingRepo);
          setRepoUrl('');
          setSnackbar({
            open: true,
            message: errorMessage,
            severity: 'info',
          });
          return;
        }
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const filterRepositories = useCallback(
    (repos: Repository[]) => {
      let filtered = repos;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          repo =>
            repo.name.toLowerCase().includes(query) ||
            repo.owner.toLowerCase().includes(query) ||
            repo.description?.toLowerCase().includes(query)
        );
      }

      switch (filterBy) {
        case 'seen':
          filtered = filtered.filter(repo => repo.latestRelease?.seen);
          break;
        case 'unseen':
          filtered = filtered.filter(repo => repo.latestRelease && !repo.latestRelease.seen);
          break;
      }

      return [...filtered].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'releaseDate':
            const dateA = a.latestRelease?.releaseDate || '';
            const dateB = b.latestRelease?.releaseDate || '';
            comparison = dateB.localeCompare(dateA);
            break;
          case 'addedDate':
            const creationDateA = a.createdAt || '';
            const creationDateB = b.createdAt || '';
            comparison = creationDateB.localeCompare(creationDateA);
            break;
          case 'status':
            const statusA = a.latestRelease?.seen ? 1 : 0;
            const statusB = b.latestRelease?.seen ? 1 : 0;
            comparison = statusA - statusB;
            break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    },
    [searchQuery, filterBy, sortBy, sortDirection]
  );

  const repositories = filterRepositories(data?.repositories || []);

  const handleRepositorySelect = (repo: Repository) => {
    setSelectedRepo(repo);
    setSelectedRelease(repo.latestRelease || null);

    const repoElement = document.getElementById(`repo-${repo.id}`);
    if (repoElement) {
      repoElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  useEffect(() => {
    if (!selectedRepo && repositories.length > 0 && window.innerWidth >= 1024) {
      handleRepositorySelect(repositories[0]);
    }
  }, [repositories, selectedRepo]);

  const handleMarkAsSeen = async (releaseId: string, seen: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const release =
        selectedRepo?.releases?.find(r => r.id === releaseId) || selectedRepo?.latestRelease;
      if (!release) return;

      await markAsSeen({
        variables: { releaseId, seen },
        optimisticResponse: {
          markReleaseAsSeen: {
            __typename: 'Release',
            id: releaseId,
            seen: seen,
            version: release.version || '',
            name: release.name || release.version || '',
            description: release.description || '',
            releaseDate: release.releaseDate || '',
            githubId: release.githubId || '',
            metadata: {
              __typename: 'ReleaseMetadata',
              htmlUrl: release.metadata?.htmlUrl || '',
              tarballUrl: release.metadata?.tarballUrl || null,
              zipballUrl: release.metadata?.zipballUrl || null,
              draft: release.metadata?.draft || false,
              prerelease: release.metadata?.prerelease || false,
            },
          },
        },
        update: (cache, { data }) => {
          if (!data?.markReleaseAsSeen) return;

          cache.writeFragment({
            id: cache.identify({ __typename: 'Release', id: releaseId }),
            fragment: gql`
              fragment UpdatedRelease on Release {
                id
                seen
                version
                name
                description
                releaseDate
                githubId
                metadata {
                  htmlUrl
                  tarballUrl
                  zipballUrl
                  draft
                  prerelease
                }
              }
            `,
            data: data.markReleaseAsSeen,
          });

          cache.modify({
            fields: {
              repositories(existingRepos = []) {
                return existingRepos.map((repoRef: any) => {
                  const repo = cache.readFragment({
                    id: repoRef.__ref,
                    fragment: gql`
                      fragment RepoWithReleases on Repository {
                        id
                        name
                        owner
                        description
                        latestRelease {
                          id
                          seen
                          version
                          name
                          description
                          releaseDate
                          githubId
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
                          seen
                          version
                          name
                          description
                          releaseDate
                          githubId
                          metadata {
                            htmlUrl
                            tarballUrl
                            zipballUrl
                            draft
                            prerelease
                          }
                        }
                      }
                    `,
                  }) as Repository | null;

                  if (
                    repo?.latestRelease?.id === releaseId ||
                    repo?.releases?.some(r => r.id === releaseId)
                  ) {
                    cache.modify({
                      id: repoRef.__ref,
                      fields: {
                        latestRelease(existing) {
                          return existing?.id === releaseId
                            ? { ...existing, ...data.markReleaseAsSeen }
                            : existing;
                        },
                        releases(existing) {
                          return existing.map((release: any) =>
                            release.id === releaseId
                              ? { ...release, ...data.markReleaseAsSeen }
                              : release
                          );
                        },
                      },
                    });
                  }
                  return repoRef;
                });
              },
            },
          });

          if (selectedRelease?.id === releaseId) {
            setSelectedRelease(prev =>
              prev
                ? {
                    ...prev,
                    ...data.markReleaseAsSeen,
                  }
                : null
            );
          }

          if (selectedRepo) {
            const updatedRepo = cache.readFragment({
              id: cache.identify({ __typename: 'Repository', id: selectedRepo.id }),
              fragment: gql`
                fragment FullRepository on Repository {
                  id
                  name
                  owner
                  description
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
                }
              `,
            }) as Repository;

            if (updatedRepo) {
              setSelectedRepo(updatedRepo);
            }
          }
        },
      });

      setSnackbar({
        open: true,
        message: `Release marked as ${seen ? 'seen' : 'unseen'}`,
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating release status',
        severity: 'error',
      });
    }
  };

  const handleDeleteRepository = async (repo: Repository, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteRepository({
        variables: { id: repo.id },
        optimisticResponse: {
          removeRepository: true,
        },
        update: cache => {
          cache.modify({
            fields: {
              repositories(existingRepos = [], { readField }) {
                return existingRepos.filter(
                  (repoRef: { __ref: string }) => readField('id', repoRef) !== repo.id
                );
              },
            },
          });

          cache.evict({ id: cache.identify({ __typename: 'Repository', id: repo.id }) });
          cache.gc();
        },
      });

      if (selectedRepo?.id === repo.id) {
        setSelectedRepo(null);
      }
      setSnackbar({
        open: true,
        message: 'Repository deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error deleting repository',
        severity: 'error',
      });
    }
  };

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data } = await refreshRepository({
        variables: { id: selectedRepo?.id },
        update: (cache, { data }) => {
          if (!data?.refreshRepository) return;

          cache.writeFragment({
            id: cache.identify({ __typename: 'Repository', id: data.refreshRepository.id }),
            fragment: gql`
              fragment RefreshedRepo on Repository {
                id
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
              }
            `,
            data: data.refreshRepository,
          });

          if (selectedRepo?.id === data.refreshRepository.id) {
            setSelectedRepo(data.refreshRepository);
            setSelectedRelease(data.refreshRepository.latestRelease || null);
          }
        },
      });

      setSnackbar({
        open: true,
        message: 'Repository refreshed successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error refreshing repository',
        severity: 'error',
      });
    }
  };

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(option);
      setSortDirection('asc');
    }
    setSortAnchorEl(null);
  };

  useEffect(() => {
    if (selectedRepo && filterBy !== 'all') {
      const isVisible = repositories.some(repo => repo.id === selectedRepo.id);
      if (!isVisible) {
        setSelectedRepo(null);
      }
    }
  }, [repositories, selectedRepo, filterBy]);

  const handleReleaseClick = (release: Release) => {
    setSelectedRelease(release);
    setReleaseHistoryAnchorEl(null);
  };

  const renderReleaseHistory = (repo: Repository) => {
    if (!repo.releases || repo.releases.length === 0) return null;

    const sortedReleases = [...repo.releases].sort((a, b) => {
      if (!a.releaseDate || !b.releaseDate) return 0;
      return Number(b.releaseDate) - Number(a.releaseDate);
    });

    return (
      <Box>
        <ReleaseHistoryButton
          onClick={e => setReleaseHistoryAnchorEl(e.currentTarget)}
          endIcon={<ArrowDownIcon />}
          size="small"
        >
          Release History
        </ReleaseHistoryButton>
        <Menu
          anchorEl={releaseHistoryAnchorEl}
          open={Boolean(releaseHistoryAnchorEl)}
          onClose={() => setReleaseHistoryAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              maxHeight: '300px',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '::-webkit-scrollbar': {
                display: 'none',
              },
            },
          }}
        >
          {sortedReleases.map(release => (
            <MenuItem
              key={release.id}
              onClick={() => handleReleaseClick(release)}
              selected={selectedRelease?.id === release.id}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: release.seen ? 'success.main' : 'warning.main',
                  }}
                />
                <Typography>{release.version}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  };

  const markdownComponents: Components = {
    pre: ({ children }) => (
      <pre
        style={{
          backgroundColor: theme.palette.grey[100],
          padding: theme.spacing(2),
          borderRadius: theme.shape.borderRadius,
          overflowX: 'auto',
        }}
      >
        {children}
      </pre>
    ),
    code: ({ children }) => (
      <code
        style={{
          backgroundColor: theme.palette.grey[100],
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.875em',
          fontFamily: 'monospace',
        }}
      >
        {children}
      </code>
    ),
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  };

  const renderReleaseDetails = (release: Release) => (
    <ReleaseDetails
      release={release}
      onMarkAsSeen={handleMarkAsSeen}
      markdownComponents={markdownComponents}
    />
  );

  const renderRepositoryButtons = (repo: Repository) => (
    <ActionButtons
      repo={repo}
      onMarkAsSeen={handleMarkAsSeen}
      onRefresh={handleRefresh}
      onDelete={handleDeleteRepository}
    />
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading repositories: {error.message}
      </Alert>
    );
  }

  return (
    <Container>
      <Header>
        <Box display="flex" alignItems="center" gap={2}>
          <GitHubIcon
            sx={{
              fontSize: 40,
              background: `linear-gradient(135deg, #000000 0%, #333333 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
            }}
          />
          <Typography
            variant="h4"
            sx={{
              color: '#000000',
              background: `linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.8) 100%)`,
              backgroundSize: '200% auto',
              animation: 'gradient 3s ease infinite',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              '@keyframes gradient': {
                '0%': {
                  backgroundPosition: '0% center',
                },
                '50%': {
                  backgroundPosition: '100% center',
                },
                '100%': {
                  backgroundPosition: '0% center',
                },
              },
            }}
          >
            GitHub Release Tracker
          </Typography>
        </Box>
        <Box
          sx={{
            width: '100%',
            maxWidth: '800px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box display="flex" gap={2} alignItems="center">
            <StyledTextField
              fullWidth
              placeholder="Enter GitHub repository URL to track ( ctrl + / )"
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              inputRef={repoInputRef}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <GitHubIcon sx={{ color: 'grey.400' }} />
                  </InputAdornment>
                ),
              }}
            />
            <AddButton
              variant="contained"
              onClick={handleAddRepository}
              disabled={!repoUrl}
              startIcon={<AddIcon />}
            >
              Add
            </AddButton>
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            <StyledTextField
              fullWidth
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'grey.400' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ mr: 1 }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <StyledIconButton onClick={e => setSortAnchorEl(e.currentTarget)}>
              <SortIcon />
            </StyledIconButton>
            <StyledIconButton onClick={e => setFilterAnchorEl(e.currentTarget)}>
              <FilterIcon />
            </StyledIconButton>
          </Box>
        </Box>
      </Header>
      <ContentContainer>
        <LeftPanel elevation={0}>
          <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
            {!repositories.length ? (
              <Box display="flex" flexDirection="column" alignItems="center" gap={2} p={4}>
                <Typography variant="h6" color="text.secondary">
                  {searchQuery || filterBy !== 'all' ? 'No matches found' : 'No repositories found'}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  {searchQuery || filterBy !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Add a repository to get started tracking releases'}
                </Typography>
              </Box>
            ) : (
              repositories.map((repo, index) => {
                const isSelected = selectedRepo?.id === repo.id;
                return (
                  <React.Fragment key={repo.id}>
                    <ListItem id={`repo-${repo.id}`} disablePadding={true}>
                      <StyledListItemButton
                        selected={isSelected}
                        onClick={() => {
                          setSelectedRepo(repo);
                          setSelectedRelease(repo.latestRelease || null);
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body1" noWrap sx={{ flex: 1 }}>
                                {highlightText(repo.name, searchQuery)}
                              </Typography>
                              {renderRepositoryButtons(repo)}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {highlightText(repo.owner, searchQuery)}
                                {repo.description && (
                                  <>
                                    {' • '}
                                    {highlightText(repo.description, searchQuery)}
                                  </>
                                )}
                              </Typography>
                              {repo.latestRelease && (
                                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                  <VersionChip
                                    label={repo.latestRelease.version}
                                    size="small"
                                    variant="outlined"
                                    color={repo.latestRelease.seen ? 'success' : 'warning'}
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(repo.latestRelease.releaseDate)}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </StyledListItemButton>
                    </ListItem>
                    <Divider />
                    {isSelected && window.innerWidth < theme.breakpoints.values.md && (
                      <>
                        <Box p={2} bgcolor="grey.50">
                          <Box display="flex" flexDirection="column" gap={2}>
                            <Typography variant="h6" gutterBottom>
                              {repo.owner}/{repo.name}
                            </Typography>
                            {repo.description && (
                              <Typography variant="body2" color="text.secondary">
                                {repo.description}
                              </Typography>
                            )}
                            {renderReleaseHistory(repo)}
                            {selectedRelease ? (
                              renderReleaseDetails(selectedRelease)
                            ) : repo.latestRelease ? (
                              renderReleaseDetails(repo.latestRelease)
                            ) : (
                              <Alert
                                severity="info"
                                sx={{
                                  borderRadius: 2,
                                  backgroundColor: 'info.light' + '20',
                                }}
                              >
                                No releases available for this repository.
                              </Alert>
                            )}
                          </Box>
                        </Box>
                        <Divider />
                      </>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </List>
        </LeftPanel>

        <RightPanel elevation={0}>
          {selectedRepo ? (
            <>
              <Box display="flex" alignItems="flex-start" mb={4}>
                <Box display="flex" flexDirection="column" gap={2} width="100%">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box flex={1} minWidth={0}>
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {selectedRepo.owner}/{selectedRepo.name}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          maxWidth: '600px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {selectedRepo.description}
                      </Typography>
                    </Box>
                    {renderReleaseHistory(selectedRepo)}
                  </Box>
                </Box>
              </Box>

              {selectedRelease ? (
                renderReleaseDetails(selectedRelease)
              ) : selectedRepo.latestRelease ? (
                renderReleaseDetails(selectedRepo.latestRelease)
              ) : (
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 2,
                    backgroundColor: 'info.light' + '20',
                  }}
                >
                  No releases available for this repository.
                </Alert>
              )}
            </>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              gap={2}
            >
              <GitHubIcon sx={{ fontSize: 48, color: 'grey.300' }} />
              <Typography color="text.secondary" variant="h6">
                Select a repository to view its details
              </Typography>
            </Box>
          )}
        </RightPanel>

        <Menu
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={() => setSortAnchorEl(null)}
        >
          <MenuItem onClick={() => handleSort('name')} selected={sortBy === 'name'}>
            <Box display="flex" alignItems="center" gap={1}>
              Sort by name
              {sortBy === 'name' &&
                (sortDirection === 'asc' ? (
                  <ArrowUpIcon fontSize="small" />
                ) : (
                  <ArrowDownIcon fontSize="small" />
                ))}
            </Box>
          </MenuItem>
          <MenuItem onClick={() => handleSort('releaseDate')} selected={sortBy === 'releaseDate'}>
            <Box display="flex" alignItems="center" gap={1}>
              Sort by release date
              {sortBy === 'releaseDate' &&
                (sortDirection === 'asc' ? (
                  <ArrowUpIcon fontSize="small" />
                ) : (
                  <ArrowDownIcon fontSize="small" />
                ))}
            </Box>
          </MenuItem>
          <MenuItem onClick={() => handleSort('addedDate')} selected={sortBy === 'addedDate'}>
            <Box display="flex" alignItems="center" gap={1}>
              Sort by added date
              {sortBy === 'addedDate' &&
                (sortDirection === 'asc' ? (
                  <ArrowUpIcon fontSize="small" />
                ) : (
                  <ArrowDownIcon fontSize="small" />
                ))}
            </Box>
          </MenuItem>
          <MenuItem onClick={() => handleSort('status')} selected={sortBy === 'status'}>
            <Box display="flex" alignItems="center" gap={1}>
              Sort by status
              {sortBy === 'status' &&
                (sortDirection === 'asc' ? (
                  <ArrowUpIcon fontSize="small" />
                ) : (
                  <ArrowDownIcon fontSize="small" />
                ))}
            </Box>
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={() => setFilterAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              setFilterBy('all');
              setFilterAnchorEl(null);
            }}
            selected={filterBy === 'all'}
          >
            Show all
          </MenuItem>
          <MenuItem
            onClick={() => {
              setFilterBy('seen');
              setFilterAnchorEl(null);
            }}
            selected={filterBy === 'seen'}
          >
            Show seen only
          </MenuItem>
          <MenuItem
            onClick={() => {
              setFilterBy('unseen');
              setFilterAnchorEl(null);
            }}
            selected={filterBy === 'unseen'}
          >
            Show unseen only
          </MenuItem>
        </Menu>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={2000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{
              width: '100%',
              backgroundColor: theme => {
                if (snackbar.message.includes('already in your watch list'))
                  return theme.palette.error.main;
                if (snackbar.severity === 'error') return theme.palette.error.light + '20';
                return theme.palette.grey[900];
              },
              color: theme => {
                if (snackbar.message.includes('already in your watch list'))
                  return theme.palette.common.white;
                if (snackbar.severity === 'error') return theme.palette.error.main;
                return theme.palette.common.white;
              },
              '& .MuiAlert-icon': {
                color: theme => {
                  if (snackbar.message.includes('already in your watch list'))
                    return theme.palette.common.white;
                  if (snackbar.severity === 'error') return theme.palette.error.main;
                  return theme.palette.common.white;
                },
              },
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </ContentContainer>
    </Container>
  );
};
export default RepositoryList;
