// Test wallet addresses for x402 transaction examples
// These are loaded from environment variables to keep them private

export const TEST_WALLETS = {
  WALLET_1: process.env.NEXT_PUBLIC_TEST_WALLET_1 || 'Loading...',
  WALLET_2: process.env.NEXT_PUBLIC_TEST_WALLET_2 || 'Loading...',
  WALLET_3: process.env.NEXT_PUBLIC_TEST_WALLET_3 || 'Loading...',
  WALLET_4: process.env.NEXT_PUBLIC_TEST_WALLET_4 || 'Loading...',
  WALLET_5: process.env.NEXT_PUBLIC_TEST_WALLET_5 || 'Loading...',
  WALLET_6: process.env.NEXT_PUBLIC_TEST_WALLET_6 || 'Loading...',
  WALLET_7: process.env.NEXT_PUBLIC_TEST_WALLET_7 || 'Loading...',
} as const;

// Get a random wallet for demo purposes
export function getRandomWallet(): string {
  const wallets = Object.values(TEST_WALLETS);
  return wallets[Math.floor(Math.random() * wallets.length)];
}

// Get a specific wallet by index (1-7)
export function getWallet(index: number): string {
  if (index < 1 || index > 7) {
    throw new Error('Wallet index must be between 1 and 7');
  }
  return TEST_WALLETS[`WALLET_${index}` as keyof typeof TEST_WALLETS];
}

