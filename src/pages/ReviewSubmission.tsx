import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, Clock, XCircle, FileText, ZoomIn, Download, Mail, AlertCircle, Eye, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import PremiumLoader from '../components/PremiumLoader';

interface SubmissionData {
  submissionId: string;
  studentName: string;
  apprenticeEmail: string;
  professorEmail: string;
  operatingSystem: string;
  moduleName: string;
  moduleNumber: string;
  screenshotUrls: Record<string, string>;
  completedTasks: string[];
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Needs Work';
  professorNotes?: string;
}

const ReviewSubmission = ({ submissionId }: { submissionId: string }) => {
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const toast = useToast();

  // Check if viewer is professor (has review=true parameter)
  const urlParams = new URLSearchParams(window.location.search);
  const isProfessorView = urlParams.get('review') === 'true';
  
  // Check if submission is already reviewed (locked)
  const isReviewed = submission ? (submission.status === 'Approved' || submission.status === 'Needs Work') : false;

  useEffect(() => {
    fetchSubmission();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      console.log('[ReviewSubmission] Fetching submission with ID:', submissionId);

      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('submissionId', submissionId)
        .single();

      console.log('[ReviewSubmission] Submission data:', data);
      console.log('[ReviewSubmission] Submission error:', error);

      if (error) {
        console.error('[ReviewSubmission] Error details:', { code: error.code, message: error.message, details: error.details });
        throw new Error('Failed to fetch submission');
      }

      if (!data) {
        throw new Error('Submission not found');
      }

      // Parse the screenshotUrls field
      let parsedScreenshots = {};
      try {
        parsedScreenshots = JSON.parse(data.screenshotUrls || '{}');
      } catch (e) {
        console.error('Error parsing screenshotUrls:', e);
      }

      // Parse completedTasks
      let parsedTasks = [];
      try {
        parsedTasks = JSON.parse(data.completedTasks || '[]');
      } catch (e) {
        console.error('Error parsing completedTasks:', e);
      }
      
      setSubmission({
        submissionId: data.submissionId,
        studentName: data.studentName,
        apprenticeEmail: data.apprenticeEmail,
        professorEmail: data.professorEmail,
        operatingSystem: data.operatingSystem || 'N/A',
        moduleName: data.moduleName || 'Unknown Module',
        moduleNumber: data.moduleNumber || '',
        screenshotUrls: parsedScreenshots,
        completedTasks: parsedTasks,
        submittedAt: data.submittedAt,
        status: data.status || 'Pending',
        professorNotes: data.professorNotes
      });
      
      setNotes(data.professorNotes || '');
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: 'Approved' | 'Needs Work') => {
    if (!submission) return;
    
    setUpdating(true);
    try {
      // Update submission status
      const { error: updateError } = await supabase
        .from('submissions')
        .update({
          status: newStatus,
          professorNotes: notes
        })
        .eq('submissionId', submissionId);

      if (updateError) {
        throw new Error('Failed to update submission');
      }

      // Update Progress table
      const { error: progressError } = await supabase
        .from('progress')
        .update({
          Status: newStatus === 'Approved' ? 'Completed' : 'In Progress'
        })
        .eq('apprenticeEmail', submission.apprenticeEmail)
        .eq('module', submission.moduleName);

      if (progressError) {
        console.error('Error updating progress:', progressError);
      }

      setSubmission({ ...submission, status: newStatus, professorNotes: notes });

      // Send email notification
      await sendEmailNotification(newStatus);

      toast.success(`Submission ${newStatus === 'Approved' ? 'approved' : 'returned for revision'}!`);
    } catch (err) {
      toast.error('Failed to update status');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const sendEmailNotification = async (status: 'Approved' | 'Needs Work') => {
    if (!submission) return;

    try {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID,
          template_id: import.meta.env.VITE_EMAILJS_FEEDBACK_TEMPLATE_ID,
          user_id: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
          template_params: {
            student_name: submission.studentName,
            module_name: submission.moduleName,
            module_number: submission.moduleNumber,
            status: status,
            professor_notes: notes,
            to_email: submission.apprenticeEmail,
            professor_email: submission.professorEmail
          }
        })
      });
    } catch (error) {
      console.error('Email notification failed:', error);
    }
  };

  // Memoize screenshotEntries to prevent useEffect dependency issues
  const screenshotEntries = useMemo(
    () => submission ? Object.entries(submission.screenshotUrls) : [],
    [submission]
  );

  const openLightbox = (url: string, index: number) => {
    setLightboxImage(url);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (lightboxIndex - 1 + screenshotEntries.length) % screenshotEntries.length
      : (lightboxIndex + 1) % screenshotEntries.length;
    setLightboxIndex(newIndex);
    setLightboxImage(screenshotEntries[newIndex][1]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxImage) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') {
        const newIndex = (lightboxIndex - 1 + screenshotEntries.length) % screenshotEntries.length;
        setLightboxIndex(newIndex);
        setLightboxImage(screenshotEntries[newIndex][1]);
      }
      if (e.key === 'ArrowRight') {
        const newIndex = (lightboxIndex + 1) % screenshotEntries.length;
        setLightboxIndex(newIndex);
        setLightboxImage(screenshotEntries[newIndex][1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, lightboxIndex, screenshotEntries]);

  if (loading) {
    return <PremiumLoader message="Submission Review" subMessage="Loading submission details" />;
  }

  if (error || !submission) {
    return (
      <div style={{
        fontFamily: 'Lato, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '3rem',
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <AlertCircle size={48} color="#DC2626" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: '#DC2626', marginBottom: '0.5rem' }}>Submission Not Found</h2>
          <p style={{ color: '#6B7280' }}>{error || 'The requested submission could not be found.'}</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    'Pending': { color: '#F59E0B', bg: '#FEF3C7', icon: Clock, label: 'Pending Review' },
    'Approved': { color: '#10B981', bg: '#D1FAE5', icon: CheckCircle, label: 'Approved' },
    'Needs Work': { color: '#EF4444', bg: '#FEE2E2', icon: XCircle, label: 'Needs Revision' }
  };

  const status = statusConfig[submission.status];
  const StatusIcon = status.icon;

  return (
    <div style={{
      fontFamily: 'Lato, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '28px',
                fontWeight: 700,
                color: '#004A69',
                margin: '0 0 0.5rem 0'
              }}>
                {submission.moduleName}
              </h1>
              <p style={{ color: '#6B7280', margin: 0 }}>
                Submitted by <strong>{submission.studentName}</strong> on {new Date(submission.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              background: status.bg,
              borderRadius: '12px',
              border: `2px solid ${status.color}`
            }}>
              <StatusIcon size={24} color={status.color} />
              <span style={{
                fontWeight: 600,
                color: status.color,
                fontSize: '16px'
              }}>
                {status.label}
              </span>
              {isReviewed && (
                <Lock size={16} color={status.color} style={{ marginLeft: '4px' }} />
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 0.25rem 0' }}>Apprentice Email</p>
            <p style={{ fontWeight: 600, color: '#1F2937', margin: 0 }}>{submission.apprenticeEmail}</p>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 0.25rem 0' }}>Professor Email</p>
            <p style={{ fontWeight: 600, color: '#1F2937', margin: 0 }}>{submission.professorEmail}</p>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 0.25rem 0' }}>Operating System</p>
            <p style={{ fontWeight: 600, color: '#1F2937', margin: 0 }}>{submission.operatingSystem}</p>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 0.25rem 0' }}>Submission ID</p>
            <p style={{ fontWeight: 600, color: '#1F2937', margin: 0, fontSize: '13px' }}>{submission.submissionId}</p>
          </div>
        </div>

        {/* Completed Tasks */}
        {submission.completedTasks.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              color: '#004A69',
              margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FileText size={20} />
              Completed Tasks
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {submission.completedTasks.map((task, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: '#F0FDF4',
                  borderRadius: '8px',
                  border: '1px solid #BBF7D0'
                }}>
                  <CheckCircle size={18} color="#22C55E" />
                  <span style={{ color: '#166534' }}>{task}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Screenshots */}
        {screenshotEntries.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              color: '#004A69',
              margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Eye size={20} />
              Screenshots ({screenshotEntries.length})
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              {screenshotEntries.map(([key, url], index) => (
                <div key={key} style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid #E5E7EB',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => openLightbox(url, index)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0066A2';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                >
                  <img 
                    src={url} 
                    alt={key}
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    padding: '2rem 1rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 500
                    }}>
                      {key}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <ZoomIn size={18} color="white" />
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: 'white' }}
                      >
                        <Download size={18} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professor Review Section */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            color: '#004A69',
            margin: '0 0 1rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Mail size={20} />
            Professor Review
          </h3>

          {isProfessorView && !isReviewed ? (
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes for the apprentice (optional)..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '2px solid #E5E7EB',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  marginBottom: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#0066A2'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
              />
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => updateStatus('Needs Work')}
                  disabled={updating}
                  style={{
                    padding: '1rem 2rem',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#DC2626',
                    background: '#FEE2E2',
                    border: '2px solid #DC2626',
                    borderRadius: '12px',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    opacity: updating ? 0.6 : 1,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <XCircle size={20} />
                  Request Revision
                </button>
                <button
                  onClick={() => updateStatus('Approved')}
                  disabled={updating}
                  style={{
                    padding: '1rem 2rem',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'white',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    opacity: updating ? 0.6 : 1,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                  }}
                >
                  <CheckCircle size={20} />
                  Approve
                </button>
              </div>
            </div>
          ) : isReviewed ? (
            <div>
              {submission.professorNotes && (
                <div style={{
                  padding: '1rem',
                  background: '#F9FAFB',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                  border: '1px solid #E5E7EB'
                }}>
                  <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 0.5rem 0' }}>Professor Notes:</p>
                  <p style={{ color: '#1F2937', margin: 0 }}>{submission.professorNotes}</p>
                </div>
              )}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.5rem',
                background: status.bg,
                borderRadius: '12px',
                border: `2px solid ${status.color}`
              }}>
                <Lock size={20} color={status.color} />
                <span style={{ color: status.color, fontWeight: 600 }}>
                  This submission has been reviewed and is now locked.
                </span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: 'linear-gradient(135deg, #F0F9FF 0%, #DBEAFE 100%)',
                borderRadius: '16px',
                padding: '3rem 2.5rem',
                border: '3px solid #BAE6FD',
                maxWidth: '600px',
                margin: '0 auto 2rem'
              }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)',
                  margin: '0 auto 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0,102,162,0.3)'
                }}>
                  <Eye size={36} color="white" />
                </div>
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#004A69',
                  margin: '0 0 1rem 0'
                }}>
                  Viewing Submission
                </h3>
                <div style={{
                  width: '48px',
                  height: '3px',
                  background: '#0066A2',
                  margin: '0 auto 1.5rem',
                  borderRadius: '2px'
                }}></div>
                <p style={{
                  fontSize: '16px',
                  color: '#0C4A6E',
                  margin: 0,
                  lineHeight: '1.7',
                  fontWeight: 500
                }}>
                  You're viewing this submission in read-only mode.<br />
                  Only your professor can approve or request revisions.
                </p>
              </div>
              
              <button
                onClick={() => {
                  const dashboardUrl = document.referrer.includes('/dashboard/') 
                    ? document.referrer 
                    : '/';
                  window.location.href = dashboardUrl;
                }}
                style={{
                  padding: '1rem 2.5rem',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#0066A2',
                  background: 'white',
                  border: '2px solid #0066A2',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,102,162,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0066A2';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,102,162,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#0066A2';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,102,162,0.1)';
                }}
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.95)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}
        onClick={closeLightbox}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '24px',
              fontWeight: 700,
              color: '#1F2937',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            ×
          </button>

          {screenshotEntries.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox('prev');
                }}
                style={{
                  position: 'absolute',
                  left: '2rem',
                  background: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                <ChevronLeft size={24} color="#1F2937" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox('next');
                }}
                style={{
                  position: 'absolute',
                  right: '2rem',
                  background: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                <ChevronRight size={24} color="#1F2937" />
              </button>
            </>
          )}

          <div style={{
            position: 'absolute',
            bottom: '2rem',
            background: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#1F2937',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            {lightboxIndex + 1} of {screenshotEntries.length}
          </div>

          <img 
            src={lightboxImage}
            alt="Screenshot preview"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReviewSubmission;
