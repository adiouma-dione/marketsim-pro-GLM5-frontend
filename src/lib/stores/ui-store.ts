// ============================================================
// MarketSim Pro - UI Store (Zustand)
// ------------------------------------------------------------

import { create } from 'zustand';

// ------------------------------------------------------------
// UI State Interface
// ------------------------------------------------------------

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Modals
  activeModal: string | null;
  modalData: Record<string, unknown> | null;

  // Notifications
  notifications: NotificationItem[];
  unreadCount: number;

  // Theme
  theme: 'light' | 'dark' | 'system';

  // Loading states
  globalLoading: boolean;
  loadingMessage: string;
}

interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
}

interface UIActions {
  // Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Modals
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Notifications
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Loading
  setGlobalLoading: (loading: boolean, message?: string) => void;

  // Reset
  reset: () => void;
}

type UIStore = UIState & UIActions;

// ------------------------------------------------------------
// Initial State
// ------------------------------------------------------------

const initialState: UIState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeModal: null,
  modalData: null,
  notifications: [],
  unreadCount: 0,
  theme: 'light',
  globalLoading: false,
  loadingMessage: '',
};

// ------------------------------------------------------------
// UI Store
// ------------------------------------------------------------

export const useUIStore = create<UIStore>()((set, get) => ({
  ...initialState,

  // Sidebar
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  toggleSidebarCollapsed: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed });
  },

  // Modals
  openModal: (modalId: string, data?: Record<string, unknown>) => {
    set({ activeModal: modalId, modalData: data || null });
  },

  closeModal: () => {
    set({ activeModal: null, modalData: null });
  },

  // Notifications
  addNotification: (notification) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
      unreadCount: state.unreadCount + 1,
    }));
  },

  markNotificationRead: (id: string) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const unreadCount = notifications.filter((n) => !n.read).length;
      return { notifications, unreadCount };
    });
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  // Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('marketsim-theme', theme);
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        document.documentElement.classList.toggle('dark', systemTheme === 'dark');
      } else {
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
    }
  },

  // Loading
  setGlobalLoading: (loading: boolean, message = '') => {
    set({ globalLoading: loading, loadingMessage: message });
  },

  // Reset
  reset: () => {
    set(initialState);
  },
}));

// ------------------------------------------------------------
// Selectors
// ------------------------------------------------------------

export const selectSidebarOpen = (state: UIStore) => state.sidebarOpen;
export const selectSidebarCollapsed = (state: UIStore) => state.sidebarCollapsed;
export const selectActiveModal = (state: UIStore) => state.activeModal;
export const selectModalData = (state: UIStore) => state.modalData;
export const selectNotifications = (state: UIStore) => state.notifications;
export const selectUnreadCount = (state: UIStore) => state.unreadCount;
export const selectTheme = (state: UIStore) => state.theme;
export const selectGlobalLoading = (state: UIStore) => state.globalLoading;
