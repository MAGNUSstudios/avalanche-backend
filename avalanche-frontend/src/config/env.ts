// Environment variable configuration with type safety

interface EnvConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  supabase: {
    url: string;
    anonKey: string;
  };
  openai: {
    apiKey: string;
  };
  payments: {
    paystack: {
      publicKey: string;
    };
    flutterwave: {
      publicKey: string;
    };
  };
  avalanche: {
    network: 'mainnet' | 'testnet';
    chainId: number;
  };
  features: {
    aiAssistant: boolean;
    cryptoPayments: boolean;
  };
  analytics: {
    googleAnalyticsId?: string;
    sentryDsn?: string;
  };
  nodeEnv: string;
}

const getEnvVar = (key: string, defaultValue = ''): string => {
  return import.meta.env[key] || defaultValue;
};

const getBooleanEnvVar = (key: string, defaultValue = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === true;
};

const getNumberEnvVar = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const env: EnvConfig = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8000'),
  apiTimeout: getNumberEnvVar('VITE_API_TIMEOUT', 30000),
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  },
  openai: {
    apiKey: getEnvVar('VITE_OPENAI_API_KEY'),
  },
  payments: {
    paystack: {
      publicKey: getEnvVar('VITE_PAYSTACK_PUBLIC_KEY'),
    },
    flutterwave: {
      publicKey: getEnvVar('VITE_FLUTTERWAVE_PUBLIC_KEY'),
    },
  },
  avalanche: {
    network: getEnvVar('VITE_AVALANCHE_NETWORK', 'testnet') as 'mainnet' | 'testnet',
    chainId: getNumberEnvVar('VITE_AVALANCHE_CHAIN_ID', 43113),
  },
  features: {
    aiAssistant: getBooleanEnvVar('VITE_ENABLE_AI_ASSISTANT', true),
    cryptoPayments: getBooleanEnvVar('VITE_ENABLE_CRYPTO_PAYMENTS', false),
  },
  analytics: {
    googleAnalyticsId: getEnvVar('VITE_GOOGLE_ANALYTICS_ID'),
    sentryDsn: getEnvVar('VITE_SENTRY_DSN'),
  },
  nodeEnv: getEnvVar('VITE_NODE_ENV', 'development'),
};

// Validate required environment variables
export const validateEnv = () => {
  const required = [
    'VITE_API_BASE_URL',
  ];

  const missing = required.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    console.warn(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};
