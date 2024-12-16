import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UnseenIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Repository } from '../../types';
import { StatusIcon } from './styles';

interface ActionButtonsProps {
  repo: Repository;
  onMarkAsSeen: (releaseId: string, seen: boolean, e: React.MouseEvent) => void;
  onRefresh: (e: React.MouseEvent) => void;
  onDelete: (repo: Repository, e: React.MouseEvent) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  repo,
  onMarkAsSeen,
  onRefresh,
  onDelete,
}) => {
  return (
    <Box display="flex" sx={{ gap: { xs: 1, sm: 1, md: 0 } }}>
      {repo.latestRelease && (
        <Tooltip title={repo.latestRelease.seen ? 'Mark as unseen' : 'Mark as seen'}>
          <IconButton
            size="small"
            onClick={e => {
              e.stopPropagation();
              onMarkAsSeen(repo.latestRelease.id, !repo.latestRelease.seen, e);
            }}
            sx={{ p: 0.5 }}
          >
            <StatusIcon className={repo.latestRelease.seen ? 'seen' : 'unseen'}>
              {repo.latestRelease.seen ? (
                <CheckCircleIcon fontSize="small" />
              ) : (
                <UnseenIcon fontSize="small" />
              )}
            </StatusIcon>
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Refresh repository">
        <IconButton
          size="small"
          onClick={e => {
            e.stopPropagation();
            onRefresh(e);
          }}
          sx={{
            color: 'grey.500',
            transition: 'all 0.2s',
            '&:hover': {
              color: 'primary.main',
              backgroundColor: 'primary.light' + '20',
              transform: 'rotate(180deg)',
            },
          }}
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete repository">
        <IconButton
          size="small"
          onClick={e => {
            e.stopPropagation();
            onDelete(repo, e);
          }}
          sx={{
            color: 'grey.500',
            transition: 'all 0.2s',
            '&:hover': {
              color: 'error.main',
              backgroundColor: 'error.light' + '20',
              transform: 'scale(1.1)',
            },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ActionButtons;
