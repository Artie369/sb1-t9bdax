import { create } from 'zustand';
import { db, auth, handleFirebaseError } from '../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from '../types';
import { toast } from 'react-hot-toast';

interface FeedState {
  profiles: User[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  lastDoc: any;
  blockUser: (userId: string, blockedUserId: string) => Promise<void>;
  fetchProfiles: (userId: string) => Promise<void>;
  fetchMoreProfiles: (userId: string) => Promise<void>;
}

const ITEMS_PER_PAGE = 10;

export const useFeedStore = create<FeedState>((set, get) => ({
  profiles: [],
  loading: false,
  error: null,
  hasMore: true,
  lastDoc: null,

  fetchProfiles: async (userId: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error('Please sign in to view profiles');
      }

      set({ loading: true, error: null });
      
      // Get blocked users
      const blockedSnapshot = await getDocs(collection(db, `users/${userId}/blocked`));
      const blockedIds = new Set(blockedSnapshot.docs.map(doc => doc.id));
      
      // Query all users except current user and blocked users
      const profilesQuery = query(
        collection(db, 'users'),
        where('id', '!=', userId),
        orderBy('createdAt', 'desc'),
        limit(ITEMS_PER_PAGE)
      );

      const snapshot = await getDocs(profilesQuery);
      const profiles = snapshot.docs
        .map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        } as User))
        .filter(profile => !blockedIds.has(profile.id));

      set({ 
        profiles,
        loading: false,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === ITEMS_PER_PAGE,
        error: null
      });

    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      set({ 
        error: errorMessage,
        loading: false,
        profiles: [],
        hasMore: false
      });
      toast.error(errorMessage);
    }
  },

  blockUser: async (userId: string, blockedUserId: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error('Please sign in to block users');
      }

      set({ loading: true, error: null });

      // Add to blocked collection
      await setDoc(doc(db, 'users', userId, 'blocked', blockedUserId), {
        blockedAt: serverTimestamp()
      });

      // Remove blocked user from profiles
      set(state => ({
        profiles: state.profiles.filter(profile => profile.id !== blockedUserId),
        loading: false,
        error: null
      }));

      toast.success('User blocked successfully');
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  }
}));