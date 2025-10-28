import { useState, useEffect } from 'react';
import styles from '../styles/VaultBalance.module.css';

interface VaultData {
  success: boolean;
  vaultAddress?: string;
  balances: {
    sol: number;
    usdc: number;
  };
  scanUrl?: string;
  message?: string;
}

export default function VaultBalance() {
  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVaultBalance();
    // Refresh every 30 seconds
    const interval = setInterval(fetchVaultBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchVaultBalance = async () => {
    try {
      const res = await fetch('/api/vault-balance');
      const data = await res.json();
      setVaultData(data);
    } catch (error) {
      console.error('Failed to fetch vault balance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.vaultCard}>
        <h3>Vault Balance</h3>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!vaultData || !vaultData.success) {
    return (
      <div className={styles.vaultCard}>
        <h3>Vault Balance</h3>
        <p className={styles.message}>{vaultData?.message || 'Vault not configured'}</p>
      </div>
    );
  }

  return (
    <div className={styles.vaultCard}>
      <div className={styles.header}>
        <h3>Vault Balance</h3>
        <button onClick={fetchVaultBalance} className={styles.refreshBtn}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      <div className={styles.balances}>
        <div className={styles.balance}>
          <div className={styles.label}>USDC</div>
          <div className={styles.amount}>
            ${vaultData.balances.usdc.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </div>
        </div>

        <div className={styles.balance}>
          <div className={styles.label}>SOL</div>
          <div className={styles.amount}>
            {vaultData.balances.sol.toLocaleString('en-US', { 
              minimumFractionDigits: 4, 
              maximumFractionDigits: 4 
            })}
          </div>
        </div>
      </div>

      {vaultData.vaultAddress && (
        <div className={styles.address}>
          <div className={styles.addressLabel}>Vault Address:</div>
          <a 
            href={vaultData.scanUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.addressLink}
          >
            {vaultData.vaultAddress.substring(0, 8)}...{vaultData.vaultAddress.substring(vaultData.vaultAddress.length - 8)}
          </a>
        </div>
      )}

      <div className={styles.note}>
        Auto-refreshes every 30s
      </div>
    </div>
  );
}

