import { useState, useEffect, useMemo } from 'react';
import { User, Camera, Award, Flame, Target, Trophy, Star, Zap, Calendar, TrendingUp, Edit3, Check, X, Clock } from 'lucide-react';
import { ProgressRing, AchievementBadge } from './StatusIndicators';

interface ProfileData {
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'professor' | 'apprentice';
  createdAt?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  specialties?: string[];
  // Stats
  totalApprentices?: number;
  completionRate?: number;
  avgResponseTime?: string;
  // Activity
  lastActive?: string;
  streak?: number;
}

interface PremiumProfileProps {
  profile: ProfileData;
  onUpdateProfile?: (updates: Partial<ProfileData>) => Promise<void>;
  onUploadAvatar?: (file: File) => Promise<string>;
  isDarkMode?: boolean;
}

// Profile completion calculator
const calculateCompletion = (profile: ProfileData): { score: number; missing: string[] } => {
  const fields = [
    { key: 'name', label: 'Full name' },
    { key: 'email', label: 'Email' },
    { key: 'avatarUrl', label: 'Profile photo' },
    { key: 'phone', label: 'Phone number' },
    { key: 'bio', label: 'Bio' },
    { key: 'specialties', label: 'Teaching specialties' }
  ];

  const filled = fields.filter(f => {
    const value = profile[f.key as keyof ProfileData];
    if (Array.isArray(value)) return value.length > 0;
    return !!value;
  });

  const missing = fields
    .filter(f => !filled.includes(f))
    .map(f => f.label);

  return {
    score: Math.round((filled.length / fields.length) * 100),
    missing
  };
};

// Animated streak counter
const StreakCounter = ({ count, isDarkMode }: { count: number; isDarkMode?: boolean }) => {
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const increment = count / 20;
    const timer = setInterval(() => {
      current += increment;
      if (current >= count) {
        setAnimatedCount(count);
        clearInterval(timer);
      } else {
        setAnimatedCount(Math.floor(current));
      }
    }, 50);
    return () => clearInterval(timer);
  }, [count]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      borderRadius: '12px',
      color: 'white'
    }}>
      <Flame size={24} style={{ animation: 'flicker 0.5s ease infinite alternate' }} />
      <div>
        <div style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1 }}>
          {animatedCount}
        </div>
        <div style={{ fontSize: '11px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Day Streak
        </div>
      </div>
      <style>{`
        @keyframes flicker {
          0% { transform: scale(1) rotate(-5deg); }
          100% { transform: scale(1.1) rotate(5deg); }
        }
      `}</style>
    </div>
  );
};

// Specialty tag input
const SpecialtyTags = ({
  specialties,
  onUpdate,
  isDarkMode
}: {
  specialties: string[];
  onUpdate: (tags: string[]) => void;
  isDarkMode?: boolean;
}) => {
  const [input, setInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const addTag = () => {
    if (input.trim() && !specialties.includes(input.trim())) {
      onUpdate([...specialties, input.trim()]);
      setInput('');
    }
  };

  const removeTag = (tag: string) => {
    onUpdate(specialties.filter(t => t !== tag));
  };

  const suggestions = ['Piano', 'Voice', 'Guitar', 'Violin', 'Music Theory', 'Composition', 'Jazz', 'Classical'];

  return (
    <div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: isEditing ? '0.75rem' : 0
      }}>
        {specialties.map(tag => (
          <div
            key={tag}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.375rem 0.75rem',
              background: isDarkMode ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.1)',
              border: `1px solid ${isDarkMode ? 'rgba(249, 115, 22, 0.4)' : 'rgba(249, 115, 22, 0.3)'}`,
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#F97316'
            }}
          >
            {tag}
            {isEditing && (
              <button
                onClick={() => removeTag(tag)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px',
                  cursor: 'pointer',
                  color: '#F97316',
                  display: 'flex'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        {!isEditing && specialties.length === 0 && (
          <span style={{
            fontSize: '13px',
            color: isDarkMode ? '#64748B' : '#94A3B8',
            fontStyle: 'italic'
          }}>
            No specialties added
          </span>
        )}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '20px',
              border: `1px dashed ${isDarkMode ? 'rgba(255,255,255,0.2)' : '#E2E8F0'}`,
              background: 'transparent',
              fontSize: '13px',
              color: isDarkMode ? '#94A3B8' : '#64748B',
              cursor: 'pointer'
            }}
          >
            + Add
          </button>
        )}
      </div>

      {isEditing && (
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addTag()}
              placeholder="Add a specialty..."
              style={{
                flex: 1,
                padding: '0.625rem 0.875rem',
                borderRadius: '8px',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
                background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'white',
                color: isDarkMode ? '#F1F5F9' : '#1E293B',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              onClick={addTag}
              style={{
                padding: '0 1rem',
                borderRadius: '8px',
                border: 'none',
                background: '#F97316',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Add
            </button>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                padding: '0 1rem',
                borderRadius: '8px',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #E2E8F0',
                background: 'transparent',
                color: isDarkMode ? '#E2E8F0' : '#374151',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.375rem'
          }}>
            {suggestions.filter(s => !specialties.includes(s)).slice(0, 5).map(s => (
              <button
                key={s}
                onClick={() => onUpdate([...specialties, s])}
                style={{
                  padding: '0.25rem 0.625rem',
                  borderRadius: '12px',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                  fontSize: '12px',
                  color: isDarkMode ? '#94A3B8' : '#64748B',
                  cursor: 'pointer'
                }}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main profile component
const PremiumProfile = ({
  profile,
  onUpdateProfile,
  onUploadAvatar,
  isDarkMode = false
}: PremiumProfileProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const completion = useMemo(() => calculateCompletion(profile), [profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadAvatar) return;

    setIsUploading(true);
    try {
      const url = await onUploadAvatar(file);
      await onUpdateProfile?.({ avatarUrl: url });
    } catch (err) {
      console.error('Failed to upload avatar:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value || '');
  };

  const saveEdit = async () => {
    if (editingField && onUpdateProfile) {
      await onUpdateProfile({ [editingField]: editValue });
    }
    setEditingField(null);
    setEditValue('');
  };

  // Mock achievements - in real app, calculate from actual data
  const achievements = [
    { type: 'mentor' as const, unlocked: (profile.totalApprentices || 0) >= 10 },
    { type: 'streak' as const, unlocked: (profile.streak || 0) >= 5 },
    { type: 'first-module' as const, unlocked: true },
    { type: 'perfect-submission' as const, unlocked: (profile.completionRate || 0) >= 90 },
    { type: 'fast-learner' as const, unlocked: false },
    { type: 'graduate' as const, unlocked: false }
  ];

  return (
    <div style={{
      background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'white',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: isDarkMode ? 'none' : '0 4px 24px rgba(0,0,0,0.08)',
      border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none'
    }}>
      {/* Banner header */}
      <div style={{
        height: '120px',
        background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #005580 100%)',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l9.9-9.9h-2.828zM32 0l-3.486 3.485 1.414 1.414L searching32 2.828V0h-.001zm5.657 0l-7.9 7.9 1.414 1.414 9.9-9.9h-2.828z\' fill=\'%23ffffff\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          opacity: 0.5
        }} />
      </div>

      {/* Avatar and basic info */}
      <div style={{
        padding: '0 2rem 2rem',
        marginTop: '-48px',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              border: '4px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              background: isDarkMode ? '#1E293B' : '#F1F5F9'
            }}>
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 700
                }}>
                  {profile.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>

            {/* Upload button */}
            <label style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(249, 115, 22, 0.4)',
              transition: 'transform 0.2s ease'
            }}>
              {isUploading ? (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                <Camera size={16} color="white" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Name and role */}
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: isDarkMode ? '#F1F5F9' : '#1E293B',
              margin: '0 0 0.25rem 0'
            }}>
              {profile.name || 'Unknown User'}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                color: 'white',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'capitalize'
              }}>
                {profile.role}
              </span>
              {profile.streak && profile.streak >= 3 && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: '#F59E0B',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  <Flame size={12} /> {profile.streak} day streak
                </span>
              )}
            </div>
          </div>

          {/* Completion ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ProgressRing
              progress={completion.score}
              size={72}
              strokeWidth={6}
              milestones={[25, 50, 75, 100]}
              isDarkMode={isDarkMode}
            />
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: isDarkMode ? '#94A3B8' : '#64748B',
              marginTop: '0.25rem'
            }}>
              Profile Complete
            </span>
          </div>
        </div>

        {/* Completion suggestions */}
        {completion.missing.length > 0 && (
          <div style={{
            padding: '0.875rem 1rem',
            background: isDarkMode ? 'rgba(249, 115, 22, 0.1)' : 'rgba(249, 115, 22, 0.05)',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Target size={18} color="#F97316" />
            <span style={{
              fontSize: '13px',
              color: isDarkMode ? '#F1F5F9' : '#1E293B'
            }}>
              Add your <strong>{completion.missing[0]}</strong> to complete your profile
            </span>
          </div>
        )}

        {/* Stats cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {[
            { icon: User, label: 'Apprentices', value: profile.totalApprentices || 0 },
            { icon: TrendingUp, label: 'Completion Rate', value: `${profile.completionRate || 0}%` },
            { icon: Clock, label: 'Avg Response', value: profile.avgResponseTime || '-' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}
              >
                <Icon size={20} color="#F97316" style={{ marginBottom: '0.5rem' }} />
                <div style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: isDarkMode ? '#F1F5F9' : '#1E293B'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: isDarkMode ? '#64748B' : '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Achievements */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: isDarkMode ? '#94A3B8' : '#64748B',
            margin: '0 0 1rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Award size={16} /> Achievements
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            {achievements.map((ach, idx) => (
              <AchievementBadge
                key={idx}
                type={ach.type}
                unlocked={ach.unlocked}
                size="md"
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </div>

        {/* Bio section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: isDarkMode ? '#94A3B8' : '#64748B',
              margin: 0
            }}>
              Bio
            </h3>
            {editingField !== 'bio' && (
              <button
                onClick={() => startEdit('bio', profile.bio || '')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: isDarkMode ? '#64748B' : '#94A3B8'
                }}
              >
                <Edit3 size={14} />
              </button>
            )}
          </div>
          {editingField === 'bio' ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <textarea
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                rows={3}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #E2E8F0',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'white',
                  color: isDarkMode ? '#F1F5F9' : '#1E293B',
                  fontSize: '14px',
                  resize: 'none',
                  outline: 'none'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <button
                  onClick={saveEdit}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#10B981',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #E2E8F0',
                    background: 'transparent',
                    color: isDarkMode ? '#94A3B8' : '#64748B',
                    cursor: 'pointer'
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <p style={{
              fontSize: '14px',
              color: profile.bio ? (isDarkMode ? '#E2E8F0' : '#374151') : (isDarkMode ? '#64748B' : '#94A3B8'),
              margin: 0,
              fontStyle: profile.bio ? 'normal' : 'italic'
            }}>
              {profile.bio || 'Add a bio to tell people about yourself...'}
            </p>
          )}
        </div>

        {/* Teaching specialties */}
        <div>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: isDarkMode ? '#94A3B8' : '#64748B',
            margin: '0 0 0.75rem 0'
          }}>
            Teaching Specialties
          </h3>
          <SpecialtyTags
            specialties={profile.specialties || []}
            onUpdate={(tags) => onUpdateProfile?.({ specialties: tags })}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PremiumProfile;
