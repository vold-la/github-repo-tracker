import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const LayoutRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: theme.palette.grey[50],
}));

const LayoutContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LayoutRoot>
      <LayoutContent>{children}</LayoutContent>
    </LayoutRoot>
  );
};

export default Layout;
