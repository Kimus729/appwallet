
// src/config/environments.ts
export const ENVIRONMENTS = {
  devnet: {
    gateway: 'https://devnet-gateway.multiversx.com',
    api: 'https://devnet-api.multiversx.com',
    explorer: 'https://devnet-explorer.multiversx.com',
    label: 'Devnet',
    defaultScAddress: 'erd1qqqqqqqqqqqqqpgqnw4z40lruvmkwvsx74zsx9fsaehsc6dx0qes007s7j',
    defaultFuncName: 'getPrintInfoFromHash',
    chainId: 'D',
  },
  testnet: {
    gateway: 'https://testnet-gateway.multiversx.com',
    api: 'https://testnet-api.multiversx.com',
    explorer: 'https://testnet-explorer.multiversx.com',
    label: 'Testnet',
    defaultScAddress: 'erd1qqqqqqqqqqqqqpgqgknuqz500yyedxkukz77v96n5fu4pv9j0qeseu25ch',
    defaultFuncName: 'getPrintInfoFromHash',
    chainId: 'T',
  },
  mainnet: {
    gateway: 'https://gateway.multiversx.com',
    api: 'https://api.multiversx.com',
    explorer: 'https://explorer.multiversx.com',
    label: 'Mainnet',
    // Using Testnet values as placeholders for Mainnet as per user request
    defaultScAddress: 'erd1qqqqqqqqqqqqqpgq80qxhwd9cp037sy9qfk204hkryzdl7jsld2swlj3eq',
    defaultFuncName: 'getPrintInfoFromHash',
    chainId: '1',
  },
};

export type EnvironmentKey = keyof typeof ENVIRONMENTS;

// Define a type for the structure of each environment's configuration
export type EnvironmentConfig = typeof ENVIRONMENTS[EnvironmentKey];

export const DEFAULT_ENVIRONMENT: EnvironmentKey = 'devnet';

