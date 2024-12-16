import { Box, Paper, ListItemButton, Chip, TextField, Button, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";

export const Container = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  });
  
export const Header = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  }));
  
export const ContentContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      overflow: 'auto',
    },
  }));
  
export const LeftPanel = styled(Paper)(({ theme }) => ({
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 0,
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down('md')]: {
      width: '100%',
      borderRight: 'none',
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  }));
  
export const RightPanel = styled(Paper)(({ theme }) => ({
    flex: 1,
    borderRadius: 0,
    padding: theme.spacing(4),
    overflowY: 'auto',
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  }));
  
export const StyledListItemButton = styled(ListItemButton)<{ selected?: boolean }>(
    ({ theme, selected }) => ({
      borderLeft: '3px solid transparent',
      margin: 0,
      width: '100%',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
        width: '100%',
      },
      ...(selected && {
        borderLeft: `3px solid ${theme.palette.primary.main}`,
        backgroundColor: theme.palette.action.selected,
        width: '100%',
      }),
    })
  );
  
export const VersionChip = styled(Chip)({
    borderRadius: '4px',
    height: '24px',
  });
  
export const HighlightedText = styled('span')<{ highlight: boolean }>(({ theme, highlight }) => ({
    backgroundColor: highlight ? theme.palette.primary.light + '40' : 'transparent',
    padding: highlight ? '0 2px' : 0,
    borderRadius: '4px',
  }));
  
export const StatusIcon = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: '50%',
    '&.seen': {
      backgroundColor: theme.palette.success.light + '20',
      color: theme.palette.success.main,
    },
    '&.unseen': {
      backgroundColor: theme.palette.warning.light + '20',
      color: theme.palette.warning.main,
    },
  }));
  
export const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
      height: '44px',
      backgroundColor: theme.palette.grey[50],
      transition: theme.transitions.create(['background-color', 'box-shadow', 'border-color']),
      borderRadius: '12px',
      '&:hover': {
        backgroundColor: theme.palette.grey[100],
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette.background.paper,
        boxShadow: `0 0 0 2px ${theme.palette.grey[900]}20`,
      },
      '& fieldset': {
        borderColor: theme.palette.grey[200],
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: theme.palette.grey[300],
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.grey[900],
      },
    },
    '& .MuiInputBase-input': {
      padding: '12px 16px',
      [theme.breakpoints.down('sm')]: {
        padding: '12px 4px',
      },
    },
    '& .MuiInputAdornment-root': {
      [theme.breakpoints.down('sm')]: {
        marginLeft: 0,
        marginRight: 0,
        '& .MuiSvgIcon-root': {
          fontSize: '1.2rem',
        },
      },
    },
  }));
  
export const AddButton = styled(Button)(({ theme }) => ({
    height: '44px',
    borderRadius: '12px',
    padding: theme.spacing(0, 3),
    boxShadow: 'none',
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.grey[800],
      boxShadow: 'none',
    },
    '&.Mui-disabled': {
      backgroundColor: theme.palette.grey[300],
    },
  }));
  
export const StyledIconButton = styled(IconButton)(({ theme }) => ({
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    backgroundColor: theme.palette.grey[50],
    '&:hover': {
      backgroundColor: theme.palette.grey[100],
    },
  }));
  


export const StyledMarkdown = styled('div')(({ theme }) => ({
    '& p': {
      margin: theme.spacing(1, 0),
      lineHeight: 1.6,
    },
    '& pre': {
      backgroundColor: theme.palette.grey[100],
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      overflowX: 'auto',
      margin: theme.spacing(2, 0),
      fontFamily: 'monospace',
    },
    '& code': {
      backgroundColor: theme.palette.grey[100],
      padding: theme.spacing(0.5, 1),
      borderRadius: theme.shape.borderRadius,
      fontSize: '0.875em',
      fontFamily: 'monospace',
    },
    '& ul, & ol': {
      marginLeft: theme.spacing(2),
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      '& li': {
        marginBottom: theme.spacing(0.5),
      },
    },
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      margin: theme.spacing(2, 0),
      fontWeight: 600,
      lineHeight: 1.3,
    },
    '& a': {
      color: theme.palette.primary.main,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    '& blockquote': {
      borderLeft: `4px solid ${theme.palette.grey[300]}`,
      margin: theme.spacing(2, 0),
      padding: theme.spacing(1, 2),
      color: theme.palette.text.secondary,
      backgroundColor: theme.palette.grey[50],
    },
    '& img': {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: theme.shape.borderRadius,
      margin: theme.spacing(2, 0),
    },
    '& hr': {
      border: 'none',
      height: '1px',
      backgroundColor: theme.palette.divider,
      margin: theme.spacing(2, 0),
    },
    '& table': {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: theme.spacing(2),
      '& th, & td': {
        padding: theme.spacing(1),
        border: `1px solid ${theme.palette.divider}`,
      },
      '& th': {
        backgroundColor: theme.palette.grey[50],
        fontWeight: 600,
      },
    },
  }));
  
export const ReleaseHistoryButton = styled(Button)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1, 2),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }));
  