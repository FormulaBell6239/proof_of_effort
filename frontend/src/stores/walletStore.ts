import { create } from 'zustand';
import { ethers } from 'ethers';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  address: null,
  provider: null,
  signer: null,

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

      set({
        isConnected: true,
        address,
        provider,
        signer,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  },

  disconnect: () => {
    set({
      isConnected: false,
      address: null,
      provider: null,
      signer: null,
    });
  },
}));
