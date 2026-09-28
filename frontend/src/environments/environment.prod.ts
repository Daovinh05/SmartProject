export const environment = {
  production: true,
  keycloak: {
    // Public client — KHÔNG có client_secret ở frontend
    url: 'https://id.smartsolutionvn.com.vn',
    realm: 'ssvn',
    clientId: 'ssvn-platform-client-id',
  },
  apiUrl: 'http://localhost:8080',
};
