import { create } from 'zustand';

interface UIState {
  // Modal states
  isLoginModalOpen: boolean;
  isCheckoutModalOpen: boolean;

  // Loading states
  isGlobalLoading: boolean;

  // Mobile menu
  isMobileMenuOpen: boolean;

  // Actions
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openCheckoutModal: () => void;
  closeCheckoutModal: () => void;
  setGlobalLoading: (loading: boolean) => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isLoginModalOpen: false,
  isCheckoutModalOpen: false,
  isGlobalLoading: false,
  isMobileMenuOpen: false,

  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  openCheckoutModal: () => set({ isCheckoutModalOpen: true }),
  closeCheckoutModal: () => set({ isCheckoutModalOpen: false }),

  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),

  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));

// Selector hooks
export const useIsLoginModalOpen = () => useUIStore((state) => state.isLoginModalOpen);
export const useIsGlobalLoading = () => useUIStore((state) => state.isGlobalLoading);
export const useIsMobileMenuOpen = () => useUIStore((state) => state.isMobileMenuOpen);
