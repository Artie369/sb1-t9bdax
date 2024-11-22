import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MessageCircle, Heart } from 'lucide-react';
import type { User } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useFeedStore } from '../../store/feedStore';
import { useMatchStore } from '../../store/matchStore';
import { toast } from 'react-hot-toast';

interface ProfileCardProps {
  profile: User;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { blockUser } = useFeedStore();
  const { createMatch } = useMatchStore();

  if (!user) return null;

  const handleMessage = async () => {
    try {
      const matchId = await createMatch(user.id, profile.id);
      navigate(`/chat/${matchId}`);
      toast.success('Chat started!');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Unable to start chat. Please try again.');
    }
  };

  const handleLike = async () => {
    try {
      await createMatch(user.id, profile.id);
      toast.success('Profile liked!');
    } catch (error) {
      console.error('Error liking profile:', error);
      toast.error('Unable to like profile. Please try again.');
    }
  };

  const handleBlock = async () => {
    try {
      await blockUser(user.id, profile.id);
      toast.success('User blocked');
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Unable to block user. Please try again.');
    }
  };

  // Generate a consistent color based on username
  const getInitialBgColor = (username: string) => {
    const colors = [
      'bg-primary-500',
      'bg-secondary-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className="relative h-[70vh] w-full bg-white rounded-xl shadow-lg overflow-hidden">
      {profile.profilePicture ? (
        <img
          src={profile.profilePicture}
          alt={profile.username}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${getInitialBgColor(profile.username)}`}>
          <span className="text-6xl font-bold text-white">
            {profile.username.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">
          {profile.username}, {profile.age}
        </h3>
        
        <p className="mb-4 line-clamp-2">{profile.bio}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
            {profile.genderIdentity}
          </span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
            {profile.sexualOrientation}
          </span>
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={handleBlock}
            className="p-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors rounded-full"
            aria-label="Block user"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button
            onClick={handleMessage}
            className="p-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors rounded-full"
            aria-label="Send message"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          
          <button
            onClick={handleLike}
            className="p-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors rounded-full"
            aria-label="Like profile"
          >
            <Heart className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}