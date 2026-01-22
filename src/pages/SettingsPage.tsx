import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, User, Lock, Camera, Save, CheckCircle, AlertCircle, Home, ChevronRight, LogOut, Settings, ChevronDown, Moon, Sun } from 'lucide-react';

const SettingsPage = () => {
  const { user, profile, updatePassword, refreshProfile, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage('');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          firstName,
          lastName,
          avatarUrl
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      showSuccess('Profile updated successfully!');
    } catch (err: any) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      showError('Please fill in both password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    setErrorMessage('');

    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw error;

      setNewPassword('');
      setConfirmPassword('');
      showSuccess('Password updated successfully!');
    } catch (err: any) {
      showError(err.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError('Image must be less than 2MB');
      return;
    }

    setUploadingPhoto(true);
    setErrorMessage('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);

      // Save to profile immediately
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatarUrl: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      showSuccess('Photo uploaded successfully!');
    } catch (err: any) {
      showError(err.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const displayName = profile?.firstName || profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div style={{
      fontFamily: 'Lato, sans-serif',
      minHeight: '100vh',
      background: isDarkMode
        ? 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
      transition: 'background 0.4s ease'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '1.5rem 2rem 2rem',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Breadcrumb Navigation */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem'
          }}>
            <Link
              to="/professor"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            >
              <Home size={16} />
              Dashboard
            </Link>
            <ChevronRight size={16} color="rgba(255,255,255,0.5)" />
            <span style={{
              color: 'white',
              fontSize: '14px',
              fontWeight: 600
            }}>
              Settings
            </span>
          </nav>

          {/* Title Row with Back Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h1 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '28px',
              fontWeight: 700,
              color: 'white',
              margin: 0,
              letterSpacing: '-0.5px'
            }}>
              Account Settings
            </h1>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: profile?.avatarUrl
                    ? `url(${profile.avatarUrl}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {!profile?.avatarUrl && (
                    <span style={{
                      fontFamily: "'Lora', Georgia, serif",
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'white'
                    }}>
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span>{displayName}</span>
                <ChevronDown size={16} style={{
                  transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} />
              </button>

              {showProfileMenu && (
                <>
                  <div
                    onClick={() => setShowProfileMenu(false)}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 10
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    left: 'auto',
                    marginTop: '0.5rem',
                    background: isDarkMode ? '#1f2937' : 'white',
                    borderRadius: '12px',
                    boxShadow: isDarkMode
                      ? '0 8px 32px rgba(0,0,0,0.4)'
                      : '0 8px 32px rgba(0,0,0,0.15)',
                    border: isDarkMode ? '1px solid #374151' : 'none',
                    width: '220px',
                    zIndex: 20,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      padding: '1rem',
                      borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB'
                    }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: isDarkMode ? '#F9FAFB' : '#002642',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {profile?.firstName && profile?.lastName
                          ? `${profile.firstName} ${profile.lastName}`
                          : displayName}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: isDarkMode ? '#9CA3AF' : 'rgba(0, 38, 66, 0.6)',
                        margin: 0
                      }}>
                        {user?.email}
                      </p>
                    </div>
                    <div style={{ padding: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/professor');
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: isDarkMode ? '#E5E7EB' : '#002642',
                          fontSize: '14px',
                          textAlign: 'left',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#374151' : '#F3F4F6'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Home size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                        <span>Dashboard</span>
                      </button>

                      <button
                        onClick={() => toggleDarkMode()}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: isDarkMode ? '#E5E7EB' : '#002642',
                          fontSize: '14px',
                          textAlign: 'left',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#374151' : '#F3F4F6'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {isDarkMode ? (
                          <Moon size={18} color="#9CA3AF" />
                        ) : (
                          <Sun size={18} color="#F59E0B" />
                        )}
                        <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                      </button>

                      <div style={{
                        height: '1px',
                        background: isDarkMode ? '#374151' : '#E5E7EB',
                        margin: '0.5rem 0'
                      }} />

                      <button
                        onClick={handleSignOut}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: '#DC2626',
                          fontSize: '14px',
                          textAlign: 'left',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#374151' : '#FEE2E2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Success/Error Messages */}
        {successMessage && (
          <div style={{
            background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
            border: '2px solid #10B981',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <CheckCircle size={20} color="#059669" />
            <span style={{ color: '#065F46', fontSize: '14px', fontWeight: 500 }}>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div style={{
            background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
            border: '2px solid #DC2626',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <AlertCircle size={20} color="#DC2626" />
            <span style={{ color: '#991B1B', fontSize: '14px', fontWeight: 500 }}>{errorMessage}</span>
          </div>
        )}

        {/* Profile Photo Section */}
        <section style={{
          background: isDarkMode ? '#1E293B' : 'white',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '1.5rem',
          boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <Camera size={22} color={isDarkMode ? '#60A5FA' : '#004A69'} />
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              color: isDarkMode ? '#F9FAFB' : '#004A69',
              margin: 0
            }}>
              Profile Photo
            </h2>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: avatarUrl
                ? `url(${avatarUrl}) center/cover no-repeat`
                : 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,74,105,0.3)',
              flexShrink: 0
            }}>
              {!avatarUrl && (
                <span style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '40px',
                  fontWeight: 700,
                  color: 'white'
                }}>
                  {(firstName || profile?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#004A69',
                  background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                  border: '2px solid #E5E7EB',
                  borderRadius: '10px',
                  cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Camera size={18} />
                {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
              </button>
              <p style={{
                fontSize: '13px',
                color: '#6B7280',
                margin: '0.75rem 0 0 0'
              }}>
                JPG, PNG or GIF. Max 2MB.
              </p>
            </div>
          </div>
        </section>

        {/* Personal Info Section */}
        <section style={{
          background: isDarkMode ? '#1E293B' : 'white',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '1.5rem',
          boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <User size={22} color={isDarkMode ? '#60A5FA' : '#004A69'} />
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              color: isDarkMode ? '#F9FAFB' : '#004A69',
              margin: 0
            }}>
              Personal Information
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: isDarkMode ? '#E5E7EB' : '#004A69',
                marginBottom: '0.5rem'
              }}>
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  fontSize: '15px',
                  border: isDarkMode ? '2px solid #4B5563' : '2px solid #E5E7EB',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  backgroundColor: isDarkMode ? '#374151' : 'white',
                  color: isDarkMode ? '#F9FAFB' : '#1F2937'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0066A2';
                  e.target.style.boxShadow = '0 0 0 4px rgba(0,102,162,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDarkMode ? '#4B5563' : '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: isDarkMode ? '#E5E7EB' : '#004A69',
                marginBottom: '0.5rem'
              }}>
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  fontSize: '15px',
                  border: isDarkMode ? '2px solid #4B5563' : '2px solid #E5E7EB',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  backgroundColor: isDarkMode ? '#374151' : 'white',
                  color: isDarkMode ? '#F9FAFB' : '#1F2937'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0066A2';
                  e.target.style.boxShadow = '0 0 0 4px rgba(0,102,162,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDarkMode ? '#4B5563' : '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: isDarkMode ? '#E5E7EB' : '#004A69',
              marginBottom: '0.5rem'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '15px',
                border: isDarkMode ? '2px solid #4B5563' : '2px solid #E5E7EB',
                borderRadius: '10px',
                boxSizing: 'border-box',
                backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
                color: isDarkMode ? '#9CA3AF' : '#6B7280',
                cursor: 'not-allowed'
              }}
            />
            <p style={{
              fontSize: '12px',
              color: '#9CA3AF',
              margin: '0.5rem 0 0 0'
            }}>
              Email cannot be changed
            </p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            style={{
              padding: '0.875rem 1.75rem',
              fontSize: '15px',
              fontWeight: 600,
              color: 'white',
              background: saving
                ? 'linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)'
                : 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
              border: 'none',
              borderRadius: '10px',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 4px 12px rgba(235,106,24,0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </section>

        {/* Password Section */}
        <section style={{
          background: isDarkMode ? '#1E293B' : 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <Lock size={22} color={isDarkMode ? '#60A5FA' : '#004A69'} />
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              color: isDarkMode ? '#F9FAFB' : '#004A69',
              margin: 0
            }}>
              Change Password
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: isDarkMode ? '#E5E7EB' : '#004A69',
                marginBottom: '0.5rem'
              }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  fontSize: '15px',
                  border: isDarkMode ? '2px solid #4B5563' : '2px solid #E5E7EB',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  backgroundColor: isDarkMode ? '#374151' : 'white',
                  color: isDarkMode ? '#F9FAFB' : '#1F2937'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0066A2';
                  e.target.style.boxShadow = '0 0 0 4px rgba(0,102,162,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDarkMode ? '#4B5563' : '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: isDarkMode ? '#E5E7EB' : '#004A69',
                marginBottom: '0.5rem'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  fontSize: '15px',
                  border: isDarkMode ? '2px solid #4B5563' : '2px solid #E5E7EB',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  backgroundColor: isDarkMode ? '#374151' : 'white',
                  color: isDarkMode ? '#F9FAFB' : '#1F2937'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0066A2';
                  e.target.style.boxShadow = '0 0 0 4px rgba(0,102,162,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDarkMode ? '#4B5563' : '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <button
            onClick={handleUpdatePassword}
            disabled={savingPassword}
            style={{
              padding: '0.875rem 1.75rem',
              fontSize: '15px',
              fontWeight: 600,
              color: isDarkMode ? '#E5E7EB' : '#004A69',
              background: isDarkMode
                ? 'linear-gradient(135deg, #374151 0%, #1F2937 100%)'
                : 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
              border: isDarkMode ? '2px solid #4B5563' : '2px solid #E5E7EB',
              borderRadius: '10px',
              cursor: savingPassword ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Lock size={18} />
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;
