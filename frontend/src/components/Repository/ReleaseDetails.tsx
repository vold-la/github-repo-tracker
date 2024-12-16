import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UnseenIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Release } from '../../types';
import { VersionChip, StatusIcon, StyledMarkdown } from './styles';
import { formatDate } from '../../utils';

interface ReleaseDetailsProps {
  release: Release;
  onMarkAsSeen: (releaseId: string, seen: boolean, e: React.MouseEvent) => void;
  markdownComponents?: any;
}

const ReleaseDetails: React.FC<ReleaseDetailsProps> = ({
  release,
  onMarkAsSeen,
  markdownComponents,
}) => {
  return (
    <Box
      sx={{
        backgroundColor: 'grey.50',
        borderRadius: 2,
        p: { xs: 0, sm: 3 },
        mb: 4,
      }}
    >
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <VersionChip
          label={release.version}
          color={release.seen ? 'success' : 'warning'}
          sx={{ px: 2 }}
        />
        <Typography variant="body2" color="text.secondary">
          Released on {formatDate(release.releaseDate)}
        </Typography>
        <Box flex={1} />
        <Tooltip title={release.seen ? 'Mark as unseen' : 'Mark as seen'}>
          <IconButton size="small" onClick={e => onMarkAsSeen(release.id, !release.seen, e)}>
            <StatusIcon className={release.seen ? 'seen' : 'unseen'}>
              {release.seen ? (
                <CheckCircleIcon fontSize="small" />
              ) : (
                <UnseenIcon fontSize="small" />
              )}
            </StatusIcon>
          </IconButton>
        </Tooltip>
      </Box>
      <Typography variant="h6" gutterBottom>
        {release.name || 'Release Notes'}
      </Typography>
      <StyledMarkdown>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {release.description || 'No release notes available.'}
        </ReactMarkdown>
      </StyledMarkdown>
    </Box>
  );
};

export default ReleaseDetails;
