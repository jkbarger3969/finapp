import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Client, cacheExchange, Provider, mapExchange } from 'urql'
import { multipartFetchExchange } from '@urql/exchange-multipart-fetch'
import './index.css'
import App from './App.tsx'

const TOKEN_KEY = 'finapp_auth_token';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

const client = new Client({
  url: '/graphql',
  exchanges: [
    cacheExchange,
    mapExchange({
      onError(error) {
        const isAuthError = error.graphQLErrors.some(
          (e) => e.message.includes('Unauthorized') || e.message.includes('Please log in')
        );
        if (isAuthError) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('finapp_user');
          window.location.href = '/login';
        }
      },
    }),
    multipartFetchExchange,
  ],
  fetchOptions: () => ({
    headers: getAuthHeaders(),
  }),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider value={client}>
      <App />
    </Provider>
  </StrictMode>,
)
