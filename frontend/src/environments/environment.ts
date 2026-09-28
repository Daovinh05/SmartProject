export const environment = {
  production: false,
  keycloak: {
    // Public client — KHÔNG có client_secret ở frontend
    url: 'https://id.smartsolutionvn.com.vn',
    realm: 'ssvn',
    clientId: 'ssvn-platform-client-id',
  },
  // Backend Spring Boot (dùng ở Task 7), khai báo sớm để không hardcode URL
  apiUrl: 'http://localhost:8080',
};
