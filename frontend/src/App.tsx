import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider, styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import { client } from './graphql/client';
import { theme } from './styles/theme';
import RepositoryList from './components/Repository';

const AppContainer = styled('div')({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppContainer>
            <Layout>
              <Routes>
                <Route path="/" element={<RepositoryList />} />
              </Routes>
            </Layout>
          </AppContainer>
        </Router>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
