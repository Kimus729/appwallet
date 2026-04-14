export const getMvxConfig = (env: string) => {
  if (env === 'mainnet') {
    return {
      network: 'mainnet',
      apiUrl: 'https://api.multiversx.com',
      chainId: '1',
      walletUrl: 'https://wallet.multiversx.com',
      explorerUrl: 'https://explorer.multiversx.com',
    };
  }
  if (env === 'testnet') {
    return {
      network: 'testnet',
      apiUrl: 'https://testnet-api.multiversx.com',
      chainId: 'T',
      walletUrl: 'https://testnet-wallet.multiversx.com',
      explorerUrl: 'https://testnet-explorer.multiversx.com',
    };
  }
  return {
    network: 'devnet',
    apiUrl: 'https://devnet-api.multiversx.com',
    chainId: 'D',
    walletUrl: 'https://devnet-wallet.multiversx.com',
    explorerUrl: 'https://devnet-explorer.multiversx.com',
  };
};
