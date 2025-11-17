import React, { useState, useEffect } from 'react';
import { styled } from '../stitches.config';
import Layout from '../components/layout/Layout';
import API from '../services/api';
import { DollarSign, TrendingUp, TrendingDown, Send, CreditCard } from 'lucide-react';
import WithdrawalModal from '../components/modals/WithdrawalModal'; // Assuming this modal is adapted for new backend

const PageWrapper = styled('div', {
  minHeight: '100vh',
  backgroundColor: 'var(--bg-primary)',
  paddingTop: '80px',
});

const Container = styled('div', {
  maxWidth: '1000px',
  margin: '0 auto',
  padding: '0 $6',
});

const Title = styled('h1', {
  fontSize: '$3xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$8',
});

const WalletLayout = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 350px',
  gap: '$8',
  alignItems: 'start',
});

const MainContent = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$6',
});

const Sidebar = styled('div', {
  position: 'sticky',
  top: '100px',
  display: 'flex',
  flexDirection: 'column',
  gap: '$6',
});

const Card = styled('div', {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$lg',
  padding: '$6',
});

const BalanceCard = styled(Card, {
  textAlign: 'center',
});

const BalanceAmount = styled('h2', {
  fontSize: '$5xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  margin: '$4 0',
});

const LockedBalance = styled('p', {
  fontSize: '$md',
  color: 'var(--text-secondary)',
  marginTop: '$2',
});

const TransactionHistory = styled(Card, {});

const TransactionItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$4 0',
  borderBottom: '1px solid var(--border-color)',
  '&:last-child': {
    borderBottom: 'none',
  },
});

const TransactionInfo = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$4',
});

const TransactionAmount = styled('div', {
  fontSize: '$lg',
  fontWeight: '$medium',
  color: 'var(--text-primary)',
});

const WithdrawalCard = styled(Card, {});

const ConnectStripeButton = styled('button', {
  width: '100%',
  padding: '$3 $6',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  border: 'none',
  borderRadius: '$base',
  fontSize: '$sm',
  fontWeight: '$medium',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',
  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
  },
  '&:disabled': {
    backgroundColor: 'var(--border-color)',
    cursor: 'not-allowed',
  },
});

const WalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [stripeAccountStatus, setStripeAccountStatus] = useState<any>(null);
  const [connectingStripe, setConnectingStripe] = useState(false);

  const fetchWalletData = async () => {
    try {
      console.log('Fetching wallet data...');
      const walletRes = await API.wallet.getWallet();
      console.log('Wallet response:', walletRes);
      setWallet(walletRes);

      const transactionsRes = await API.wallet.getTransactions();
      console.log('Transactions:', transactionsRes);
      setTransactions(transactionsRes);

      // Check bank account status (Stripe automatic payout system)
      try {
        const bankStatus = await API.stripePayout.getBankAccountStatus();
        console.log('Bank Account Status:', bankStatus);
        setStripeAccountStatus(bankStatus);
        setStripeConnected(bankStatus.connected && bankStatus.has_bank_account);
      } catch (bankErr) {
        console.error('Error fetching bank account status:', bankErr);
        // Default to not connected on error
        setStripeConnected(false);
        setStripeAccountStatus({
          connected: false,
          has_bank_account: false
        });
      }
    } catch (err) {
      setError('Failed to load wallet data.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectBankAccount = () => {
    // Open the withdrawal modal which now includes bank account setup
    setIsWithdrawalModalOpen(true);
  };

  useEffect(() => {
    const token = localStorage.getItem('avalanche_token');
    setIsAuthenticated(!!token);

    if (token) {
      fetchWalletData();
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <Layout isAuthenticated={isAuthenticated}><PageWrapper><Container>Loading...</Container></PageWrapper></Layout>;
  }

  if (error) {
    return <Layout isAuthenticated={isAuthenticated}><PageWrapper><Container>{error}</Container></PageWrapper></Layout>;
  }

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <PageWrapper>
        <Container>
          <Title>My Wallet</Title>
          <WalletLayout>
            <MainContent>
              <TransactionHistory>
                <h3>Recent Transactions</h3>
                {transactions.length > 0 ? (
                  transactions.map(tx => (
                    <TransactionItem key={tx.id}>
                      <TransactionInfo>
                        {tx.amount > 0 ? <TrendingUp size={24} color="green" /> : <TrendingDown size={24} color="red" />}
                        <div>
                          <p>{tx.description}</p>
                          <small>{new Date(tx.created_at).toLocaleString()}</small>
                        </div>
                      </TransactionInfo>
                      <TransactionAmount style={{ color: tx.amount > 0 ? 'green' : 'red' }}>
                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                      </TransactionAmount>
                    </TransactionItem>
                  ))
                ) : (
                  <p>No transactions yet.</p>
                )}
              </TransactionHistory>
            </MainContent>
            <Sidebar>
              <BalanceCard>
                <p>Current Balance</p>
                <BalanceAmount>${wallet ? wallet.balance.toFixed(2) : '0.00'}</BalanceAmount>
                {wallet && wallet.locked_balance > 0 && (
                  <LockedBalance>Locked: ${wallet.locked_balance.toFixed(2)}</LockedBalance>
                )}
                <small>Updated just now</small>
              </BalanceCard>
              <WithdrawalCard>
                <h3>Withdraw Funds</h3>
                <p style={{fontSize: 'small', color: 'var(--text-secondary)', margin: '8px 0'}}>
                  {!stripeConnected
                    ? 'Add your bank account to withdraw earnings'
                    : 'Withdraw your earnings to your bank account'}
                </p>
                <ConnectStripeButton
                  onClick={() => setIsWithdrawalModalOpen(true)}
                  disabled={!wallet || (wallet.balance <= 0 && stripeConnected)}
                >
                  <Send size={16} />
                  {!stripeConnected ? 'Setup Bank & Withdraw' : 'Request Withdrawal'}
                </ConnectStripeButton>
                {stripeConnected && stripeAccountStatus && stripeAccountStatus.account_holder_name && (
                  <p style={{fontSize: 'small', color: 'var(--text-secondary)', marginTop: '8px'}}>
                    💳 {stripeAccountStatus.bank_name} •••• {stripeAccountStatus.account_last4}
                  </p>
                )}
              </WithdrawalCard>
            </Sidebar>
          </WalletLayout>
        </Container>
        {isWithdrawalModalOpen && (
          <WithdrawalModal
            onClose={() => setIsWithdrawalModalOpen(false)}
            onSuccess={() => {
              fetchWalletData(); // Refetch wallet data to show updated balance and transactions
              setIsWithdrawalModalOpen(false);
            }}
            currentBalance={wallet ? wallet.balance : 0}
          />
        )}
      </PageWrapper>
    </Layout>
  );
};

export default WalletPage;