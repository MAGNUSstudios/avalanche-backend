import React, { useState } from 'react';
import { styled } from '../../stitches.config';
import API from '../../services/api';
import { X } from 'lucide-react';

const ModalOverlay = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
});

const ModalContent = styled('div', {
  backgroundColor: 'var(--card-bg)',
  padding: '$6',
  borderRadius: '$lg',
  width: '100%',
  maxWidth: '500px',
  position: 'relative',
  color: 'var(--text-primary)',
});

const CloseButton = styled('button', {
  position: 'absolute',
  top: '$4',
  right: '$4',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  '&:hover': {
    color: 'var(--text-primary)',
  },
});

const Input = styled('input', {
    width: '100%',
    padding: '$3',
    fontSize: '$base',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '$base',
    color: 'var(--text-primary)',
    marginBottom: '$4',
    '&:focus': {
        outline: 'none',
        borderColor: 'var(--primary-color)',
    },
});

const Button = styled('button', {
    width: '100%',
    padding: '$3',
    fontSize: '$base',
    fontWeight: '$medium',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '$base',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
        backgroundColor: 'var(--primary-hover)',
    },
    '&:disabled': {
        backgroundColor: 'var(--border-color)',
        cursor: 'not-allowed',
    }
});

const PayoutOptionsContainer = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '$4',
  marginBottom: '$6',
});

const PayoutOptionCard = styled('div', {
  padding: '$4',
  borderRadius: '$lg',
  border: '2px solid var(--border-color)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: 'var(--bg-secondary)',
  textAlign: 'center',
  '&:hover': {
    borderColor: 'var(--primary-color)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  variants: {
    selected: {
      true: {
        borderColor: 'var(--primary-color)',
        backgroundColor: 'var(--primary-light)',
        boxShadow: '0 0 20px var(--primary-glow)',
      },
    },
  },
});

const PayoutLogo = styled('div', {
  fontSize: '$3xl',
  marginBottom: '$2',
});

const PayoutTitle = styled('h3', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  marginBottom: '$2',
  color: 'var(--text-primary)',
});

const PayoutDescription = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  marginBottom: '$2',
});

const PayoutBadge = styled('span', {
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: '$base',
  fontSize: '$xs',
  fontWeight: '$medium',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
});

interface WithdrawalModalProps {
  onClose: () => void;
  onSuccess: () => void;
  currentBalance: number;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ onClose, onSuccess, currentBalance }) => {
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [country, setCountry] = useState('NG'); // Default to Nigeria
  const [hasBankAccount, setHasBankAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingBankInfo, setLoadingBankInfo] = useState(true);
  const [payoutMethod, setPayoutMethod] = useState<'paystack' | 'stripe' | null>(null);

  // Fetch bank account info on mount
  React.useEffect(() => {
    const fetchBankInfo = async () => {
      try {
        const bankStatus = await API.stripePayout.getBankAccountStatus();
        setHasBankAccount(bankStatus.has_bank_account);
        if (bankStatus.has_bank_account) {
          setAccountHolderName(bankStatus.account_holder_name || '');
          setBankName(bankStatus.bank_name || '');
        }
      } catch (err) {
        console.error('Error fetching bank info:', err);
      } finally {
        setLoadingBankInfo(false);
      }
    };
    fetchBankInfo();
  }, []);

  // Update default country when payout method changes
  React.useEffect(() => {
    if (payoutMethod === 'paystack') {
      setCountry('NG'); // Default to Nigeria for Paystack
    } else if (payoutMethod === 'stripe') {
      setCountry('US'); // Default to US for Stripe
    }
  }, [payoutMethod]);

  const handleWithdrawal = async () => {
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
      setError('Please enter a valid amount.');
      return;
    }
    if (parseFloat(amount) > currentBalance) {
      setError('Amount exceeds available balance.');
      return;
    }

    // Validate bank details
    if (!bankName || !accountNumber || !accountHolderName) {
      setError('Please fill in all required bank account details.');
      return;
    }

    // Validate routing number for Stripe (non-African countries)
    if (payoutMethod === 'stripe' && country !== 'NG') {
      if (!routingNumber) {
        setError('Routing number is required for US bank accounts.');
        return;
      }
      if (!/^\d{9}$/.test(routingNumber)) {
        setError('Routing number must be exactly 9 digits.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (payoutMethod === 'paystack') {
        // PAYSTACK FLOW (African countries)
        // Step 1: Add bank account to Paystack
        const paystackBankData = {
          bank_name: bankName,
          account_number: accountNumber,
          account_holder_name: accountHolderName,
          country: country
        };

        await API.paystackPayout.addAfricanBankAccount(paystackBankData);

        // Step 2: Create withdrawal request
        const withdrawalRequest = await API.wallet.requestWithdrawal({
          amount: parseFloat(amount),
          payout_method: 'paystack',
          payout_details: { method: 'paystack_bank_transfer' }
        });

        // Step 3: Process payout via Paystack
        const payoutResult = await API.paystackPayout.processPaystackPayout(withdrawalRequest.id);

        setSuccessMessage(payoutResult.message || 'Payout successful! Funds will arrive within 24 hours.');
      } else {
        // STRIPE FLOW (Global)
        // Step 1: Add bank account to Stripe
        const stripeBankData: any = {
          bank_name: bankName,
          account_number: accountNumber,
          account_holder_name: accountHolderName,
          country: country
        };

        if (country !== 'NG' && routingNumber) {
          stripeBankData.routing_number = routingNumber;
        }

        await API.stripePayout.addBankAccount(stripeBankData);

        // Step 2: Create withdrawal request
        const withdrawalRequest = await API.wallet.requestWithdrawal({
          amount: parseFloat(amount),
          payout_method: 'stripe_payout',
          payout_details: { method: 'automatic_bank_transfer' }
        });

        // Step 3: Process payout via Stripe
        const payoutResult = await API.stripePayout.processAutomaticPayout(withdrawalRequest.id);

        setSuccessMessage(payoutResult.message || 'Withdrawal processed! Funds will arrive in 2-3 business days.');
      }

      setTimeout(() => {
        onSuccess();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to process withdrawal. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingBankInfo) {
    return (
      <ModalOverlay>
        <ModalContent>
          <CloseButton onClick={onClose}><X /></CloseButton>
          <p>Loading...</p>
        </ModalContent>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}><X /></CloseButton>
        <h2 style={{ marginBottom: '16px' }}>Withdraw Funds</h2>
        {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}
        {successMessage && <p style={{ color: 'green', marginBottom: '16px' }}>{successMessage}</p>}

        <p style={{ marginBottom: '16px', fontSize: 'small', color: 'var(--text-secondary)' }}>
          Available Balance: ${currentBalance.toFixed(2)}
        </p>

        {/* Step 1: Select Payout Method */}
        {!payoutMethod && (
          <>
            <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 500 }}>
              Choose Payout Method
            </h3>
            <PayoutOptionsContainer>
              <PayoutOptionCard onClick={() => setPayoutMethod('paystack')}>
                <PayoutLogo>💳</PayoutLogo>
                <PayoutTitle>Paystack</PayoutTitle>
                <PayoutDescription>
                  Fast payouts to African banks
                </PayoutDescription>
                <PayoutBadge>Nigeria • Ghana • Kenya • SA</PayoutBadge>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  ⚡ 24 hours • Lower fees
                </p>
              </PayoutOptionCard>

              <PayoutOptionCard onClick={() => setPayoutMethod('stripe')}>
                <PayoutLogo>🌍</PayoutLogo>
                <PayoutTitle>Stripe</PayoutTitle>
                <PayoutDescription>
                  Global payouts worldwide
                </PayoutDescription>
                <PayoutBadge>USA • UK • EU • 150+ countries</PayoutBadge>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  🌎 2-7 days • Global reach
                </p>
              </PayoutOptionCard>
            </PayoutOptionsContainer>
          </>
        )}

        {/* Step 2: Bank Details Form (shown after selecting method) */}
        {payoutMethod && (
          <>
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>
                  {payoutMethod === 'paystack' ? '💳 Paystack Payout' : '🌍 Stripe Payout'}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {payoutMethod === 'paystack'
                    ? 'Fast African bank transfers'
                    : 'Global bank transfers'}
                </p>
              </div>
              <button
                onClick={() => setPayoutMethod(null)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
              >
                Change
              </button>
            </div>

        {!hasBankAccount && (
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
            <p style={{ fontSize: 'small', marginBottom: '8px', fontWeight: 500 }}>Bank Account Details</p>

            <label style={{ display: 'block', marginBottom: '4px', fontSize: 'x-small', color: 'var(--text-secondary)' }}>
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={isLoading || successMessage !== null}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '8px',
                fontSize: '14px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
              }}
            >
              {payoutMethod === 'paystack' ? (
                <>
                  <option value="NG">🇳🇬 Nigeria</option>
                  <option value="GH">🇬🇭 Ghana</option>
                  <option value="KE">🇰🇪 Kenya</option>
                  <option value="ZA">🇿🇦 South Africa</option>
                </>
              ) : (
                <>
                  <option value="US">🇺🇸 United States</option>
                  <option value="GB">🇬🇧 United Kingdom</option>
                  <option value="CA">🇨🇦 Canada</option>
                  <option value="AU">🇦🇺 Australia</option>
                  <option value="DE">🇩🇪 Germany</option>
                  <option value="FR">🇫🇷 France</option>
                </>
              )}
            </select>

            <Input
              type="text"
              placeholder={country === 'NG' ? 'Bank Name (e.g., GTBank, Access Bank)' : 'Bank Name (e.g., Chase, Bank of America)'}
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              disabled={isLoading || successMessage !== null}
              style={{ marginBottom: '8px' }}
            />
            <Input
              type="text"
              placeholder="Account Holder Name"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              disabled={isLoading || successMessage !== null}
              style={{ marginBottom: '8px' }}
            />
            <Input
              type="text"
              placeholder="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              disabled={isLoading || successMessage !== null}
              style={{ marginBottom: '8px' }}
            />
            {payoutMethod === 'stripe' && country === 'US' && (
              <Input
                type="text"
                placeholder="Routing Number (9 digits) *"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value)}
                disabled={isLoading || successMessage !== null}
                maxLength={9}
              />
            )}
            <p style={{ fontSize: 'x-small', color: 'var(--text-secondary)', marginTop: '8px' }}>
              🔒 Your bank details are securely encrypted and sent directly to {payoutMethod === 'paystack' ? 'Paystack' : 'Stripe'}
            </p>
          </div>
        )}

        {hasBankAccount && (
          <p style={{ marginBottom: '16px', fontSize: 'small', color: 'var(--text-secondary)' }}>
            💳 Withdrawing to: {bankName} - {accountHolderName}
          </p>
        )}

        <label style={{ display: 'block', marginBottom: '4px', fontSize: 'small', fontWeight: 500 }}>
          Withdrawal Amount
        </label>
        <Input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.01"
          step="0.01"
          disabled={isLoading || successMessage !== null}
          autoFocus={hasBankAccount}
        />

            <Button onClick={handleWithdrawal} disabled={isLoading || successMessage !== null}>
              {isLoading ? 'Processing...' : 'Save Bank & Withdraw'}
            </Button>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default WithdrawalModal;