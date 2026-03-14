import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: '',
      user: null,
      tenantSlug: '',
      setSession: ({ token, user, tenantSlug = '' }) => {
        set({
          token: String(token || ''),
          user: user || null,
          tenantSlug: String(tenantSlug || ''),
        });
      },
      setTenantSlug: (tenantSlug) => {
        set({ tenantSlug: String(tenantSlug || '') });
      },
      logout: () => {
        set({ token: '', user: null, tenantSlug: '' });
      },
    }),
    {
      name: 'auth-session-store',
      version: 1,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        tenantSlug: state.tenantSlug,
      }),
    }
  )
);

export default useAuthStore;