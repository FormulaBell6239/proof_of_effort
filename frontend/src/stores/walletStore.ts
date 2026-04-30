import { create } from 'zustand';
import { ethers } from 'ethers';

const TOKEN_KEY = 'poe_jwt';
const USER_KEY = 'poe_user';

function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
  if (!base) return path;
  return new URL(path, base).toString();
}

interface StoredUser {
  id: string;
  wallet_address: string;
  username: string;
  email?: string;
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  userId: string | null;
  token: string | null;
  user: StoredUser | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

function loadStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  address: null,
  provider: null,
  signer: null,
  userId: loadStoredUser()?.id ?? null,
  token: localStorage.getItem(TOKEN_KEY),
  user: loadStoredUser(),

  connect: async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to use this application');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Sign a message to prove wallet ownership and get a JWT
      const message = `Sign in to Proof-of-Effort Network\nAddress: ${address}\nTimestamp: ${Date.now()}`;
      const signature = await signer.signMessage(message);

      const res = await fetch(apiUrl('/api/v1/users/verify-signature'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address, signature, message }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Auth failed: ${text || res.statusText}`);
      }

      const { token, user } = (await res.json()) as { token: string; user: StoredUser };

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      set({
        isConnected: true,
        address,
        provider,
        signer,
        userId: user.id,
        token,
        user,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  },

  disconnect: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({
      isConnected: false,
      address: null,
      provider: null,
      signer: null,
      userId: null,
      token: null,
      user: null,
    });
  },
}));

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
