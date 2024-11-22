import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Heart, X, Check, Trash2 } from 'lucide-react';
import type { Match } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useMatchStore } from '../../store/matchStore';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface MatchCardProps {
  match: Match;
  otherUserId: string;
  lastMessage?: string;
  type: 'match' | 'like';
}

export default function MatchCard({ match, otherUserId, lastMessage, type }: MatchCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { updateMatchStatus, deleteMatch } = useMatchStore();
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        if (userDoc.exists()) {
          setOtherUser(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOtherUser();
  }, [otherUserId]);

  if (!user || loading) return null;

  const handleAcceptLike = async () => {
    try {
      await updateMatchStatus(match.id, 'matched');
      toast.success('Match accepted!');
    } catch (error) {
      console.error('Error accepting match:', error);
      toast.error('Failed to accept match. Please try again.');
    }
  };

  const handleRejectLike = async () => {
    try {
      await updateMatchStatus(match.id, 'rejected');
      toast.success('Like declined');
    } catch (error) {
      console.error('Error rejecting match:', error);
      toast.error('Failed to decline. Please try again.');
    }
  };

  const handleDeleteMatch = async () => {
    try {
      await deleteMatch(match.id);
      toast.success('Match deleted successfully');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting match:', error);
      toast.error('Failed to delete match. Please try again.');
    }
  };

  return (
    <div className={`card hover:scale-[1.02] transition-transform ${
      type === 'like' ? 'border-pink-200 bg-pink-50/50' : ''
    }`}>
      {showDeleteConfirm ? (
        <div className="p-4">
          <p className="text-center text-gray-700 mb-4">
            Are you sure you want to delete this {type}? This action cannot be undone.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteMatch}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={otherUser?.profilePicture || `https://ui-avatars.com/api/?name=${otherUser?.username}`}
              alt={otherUser?.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            {type === 'like' && (
              <div className="absolute -top-1 -right-1 bg-pink-500 rounded-full p-1">
                <Heart className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">
              {otherUser?.username}
            </h3>
            {type === 'match' && lastMessage && (
              <p className="text-sm text-gray-500 truncate">
                {lastMessage}
              </p>
            )}
            {type === 'like' && (
              <p className="text-sm text-pink-600">
                Liked your profile
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {type === 'match' ? (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors"
                  aria-label="Delete match"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
                <button
                  onClick={() => navigate(`/chat/${match.id}`)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Open chat"
                >
                  <MessageCircle className="w-5 h-5 text-primary-500" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleRejectLike}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors"
                  aria-label="Decline like"
                >
                  <X className="w-5 h-5 text-red-500" />
                </button>
                <button
                  onClick={handleAcceptLike}
                  className="p-2 hover:bg-green-100 rounded-full transition-colors"
                  aria-label="Accept like"
                >
                  <Check className="w-5 h-5 text-green-500" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}