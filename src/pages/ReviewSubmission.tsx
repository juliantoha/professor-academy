import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, FileText, ZoomIn, Download, Mail, AlertCircle, Eye, ChevronLeft, ChevronRight, Lock } from 'lucide-react';

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
  const [emailSent, setEmailSent] = useState(false);
  const [dashboardToken, setDashboardToken] = useState<string | null>(null);

  // NEW: Check if viewer is professor (has review=true parameter)
  const urlParams = new URLSearchParams(window.location.search);
  const isProfessorView = urlParams.get('review') === 'true';
  
  // NEW: Check if submission is already reviewed (locked)
  const isReviewed = submission ? (submission.status === 'Approved' || submission.status === 'Needs Work') : false;

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchDashboardToken = async (apprenticeEmail: string) => {
    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Apprentices?filterByFormula={email}='${apprenticeEmail.toLowerCase()}'`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.records.length > 0) {
          const token = data.records[0].fields.dashboardToken;
          setDashboardToken(token);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard token:', err);
    }
  };

  const fetchSubmission = async () => {
    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Submissions?filterByFormula={submissionId}='${submissionId}'`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch submission');
      }

      const data = await response.json();
      
      if (data.records.length === 0) {
        throw new Error('Submission not found');
      }

      const record = data.records[0];
      const fields = record.fields;
      
      // Parse the screenshotUrls field (not screenshots)
      let parsedScreenshots = {};
      try {
        parsedScreenshots = JSON.parse(fields.screenshotUrls || '{}');
      } catch (e) {
        console.error('Error parsing screenshotUrls:', e);
      }

      // Parse completedTasks
      let parsedTasks = [];
      try {
        parsedTasks = JSON.parse(fields.completedTasks || '[]');
      } catch (e) {
        console.error('Error parsing completedTasks:', e);
      }
      
      setSubmission({
        submissionId: fields.submissionId,
        studentName: fields.studentName,
        apprenticeEmail: fields.apprenticeEmail,
        professorEmail: fields.professorEmail,
        operatingSystem: fields.operatingSystem || 'N/A',
        moduleName: fields.moduleName || 'Unknown Module',
        moduleNumber: fields.moduleNumber || '',
        screenshotUrls: parsedScreenshots,
        completedTasks: parsedTasks,
        submittedAt: fields.submittedAt,
        status: fields.status || 'Pending',
        professorNotes: fields.professorNotes
      });
      
      setNotes(fields.professorNotes || '');
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
      const response = await fetch(
        `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Submissions?filterByFormula={submissionId}='${submissionId}'`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`
          }
        }
      );

      const data = await response.json();
      const recordId = data.records[0].id;

      await fetch(
        `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Submissions/${recordId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              status: newStatus,
              professorNotes: notes
            }
          })
        }
      );

      // Update Progress table
      const progressResponse = await fetch(
        `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Progress?filterByFormula=AND({apprenticeEmail}='${submission.apprenticeEmail}',{module}='${submission.moduleName}')`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`
          }
        }
      );

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        if (progressData.records.length > 0) {
          const progressRecordId = progressData.records[0].id;
          await fetch(
            `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Progress/${progressRecordId}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                fields: {
                  Status: newStatus === 'Approved' ? 'Completed' : 'In Progress'
                }
              })
            }
          );
        }
      }

      setSubmission({ ...submission, status: newStatus, professorNotes: notes });
      
      // Send email notification
      await sendEmailNotification(newStatus);
      
      alert(`Submission ${newStatus === 'Approved' ? 'approved' : 'returned for revision'}!`);
    } catch (err) {
      alert('Failed to update status');
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
          service_id: 'service_b7vul04',
          template_id: 'template_feedback',
          user_id: 'GImjhsi-c_0q7ZtUA',
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
      setEmailSent(true);
    } catch (error) {
      console.error('Email notification failed:', error);
    }
  };

  const openLightbox = (url: string, index: number) => {
    setLightboxImage(url);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const urls = Object.values(submission?.screenshotUrls || {});
    let newIndex = lightboxIndex;
    
    if (direction === 'prev') {
      newIndex = lightboxIndex > 0 ? lightboxIndex - 1 : urls.length - 1;
    } else {
      newIndex = lightboxIndex < urls.length - 1 ? lightboxIndex + 1 : 0;
    }
    
    setLightboxIndex(newIndex);
    setLightboxImage(urls[newIndex]);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F0F9FF 0%, #DBEAFE 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Clock size={48} color="#0066A2" style={{ animation: 'spin 2s linear infinite' }} />
          <p style={{ marginTop: '1rem', fontSize: '18px', color: '#004A69', fontWeight: 600 }}>Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', padding: '2rem' }}>
          <XCircle size={48} color="#DC2626" />
          <p style={{ marginTop: '1rem', fontSize: '18px', color: '#991B1B', fontWeight: 600 }}>
            {error || 'Submission not found'}
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              background: '#DC2626',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusColors = {
    'Pending': { bg: '#FEF3C7', color: '#92400E', borderColor: '#F59E0B', icon: Clock },
    'Approved': { bg: '#D1FAE5', color: '#065F46', borderColor: '#10B981', icon: CheckCircle },
    'Needs Work': { bg: '#FEE2E2', color: '#991B1B', borderColor: '#EF4444', icon: XCircle }
  };

  const statusStyle = statusColors[submission.status];
  const StatusIcon = statusStyle.icon;
  const screenshotEntries = Object.entries(submission.screenshotUrls);

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: `3px solid ${statusStyle.borderColor}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '0.5rem'
              }}>
                Submission Review
              </div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 700,
                color: '#004A69',
                margin: '0 0 0.5rem 0',
                lineHeight: 1.2
              }}>
                {submission.moduleNumber && submission.moduleNumber !== 'N/A' 
                  ? `${submission.moduleNumber} - ${submission.moduleName}`
                  : submission.moduleName}
              </h1>
              <p style={{ color: '#6B7280', fontSize: '15px', margin: 0 }}>
                Submitted by <strong>{submission.studentName}</strong>
              </p>
            </div>
            
            <div style={{
              background: statusStyle.bg,
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: `2px solid ${statusStyle.borderColor}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              <StatusIcon size={24} color={statusStyle.color} />
              <span style={{
                fontSize: '16px',
                fontWeight: 700,
                color: statusStyle.color,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {submission.status}
              </span>
            </div>
          </div>
          
          {/* Submission Details Grid */}
          <div style={{
            padding: '1.75rem',
            background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
            borderRadius: '14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '0.5rem', fontWeight: 600 }}>Apprentice Email</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1F2937' }}>{submission.apprenticeEmail}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '0.5rem', fontWeight: 600 }}>Operating System</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1F2937' }}>{submission.operatingSystem}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '0.5rem', fontWeight: 600 }}>Submitted Date</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1F2937' }}>
                {new Date(submission.submittedAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '0.5rem', fontWeight: 600 }}>Screenshots</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1F2937' }}>
                {screenshotEntries.length} uploaded
              </div>
            </div>
          </div>
        </div>

        {/* Screenshots Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#004A69',
              margin: 0
            }}>
              Submitted Screenshots
            </h2>
            <div style={{
              background: 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700
            }}>
              {screenshotEntries.length} Tasks
            </div>
          </div>
          
          {screenshotEntries.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              borderRadius: '14px',
              border: '2px dashed #F59E0B'
            }}>
              <AlertCircle size={48} color="#D97706" style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '18px', color: '#92400E', fontWeight: 600 }}>
                No screenshots found for this submission
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {screenshotEntries.map(([taskId, url], index) => (
                <div key={taskId} style={{
                  border: '2px solid #E5E7EB',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  background: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                  e.currentTarget.style.borderColor = '#0066A2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
                >
                  <div style={{
                    background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                    padding: '1rem 1.25rem',
                    borderBottom: '2px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#374151',
                      fontFamily: 'monospace',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {taskId}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openLightbox(url, index)}
                        style={{
                          background: 'white',
                          border: '2px solid #0066A2',
                          borderRadius: '8px',
                          padding: '0.4rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#0066A2';
                          const icon = e.currentTarget.querySelector('svg');
                          if (icon) icon.setAttribute('color', 'white');
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          const icon = e.currentTarget.querySelector('svg');
                          if (icon) icon.setAttribute('color', '#0066A2');
                        }}
                      >
                        <ZoomIn size={16} color="#0066A2" />
                      </button>
                      <a
                        href={url}
                        download
                        style={{
                          background: 'white',
                          border: '2px solid #10B981',
                          borderRadius: '8px',
                          padding: '0.4rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#10B981';
                          const icon = e.currentTarget.querySelector('svg');
                          if (icon) icon.setAttribute('color', 'white');
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          const icon = e.currentTarget.querySelector('svg');
                          if (icon) icon.setAttribute('color', '#10B981');
                        }}
                      >
                        <Download size={16} color="#10B981" />
                      </a>
                    </div>
                  </div>
                  <div style={{
                    position: 'relative',
                    paddingTop: '75%',
                    background: '#F3F4F6',
                    cursor: 'pointer'
                  }}
                  onClick={() => openLightbox(url, index)}
                  >
                    <img 
                      src={url} 
                      alt={`Screenshot for ${taskId}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
                      e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0,0,0,0)';
                      e.currentTarget.style.opacity = '0';
                    }}
                    >
                      <div style={{
                        background: 'white',
                        borderRadius: '50%',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Eye size={24} color="#0066A2" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#004A69',
            margin: '0 0 1.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <FileText size={24} />
            Feedback for Apprentice
          </h2>
          
          <div style={{
            background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
            border: '2px solid #BAE6FD',
            borderRadius: '14px',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <Mail size={20} color="#0369A1" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{
                fontSize: '14px',
                color: '#0C4A6E',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Your feedback will be sent to <strong>{submission.studentName}</strong> via email at {submission.apprenticeEmail}
              </p>
            </div>
          </div>
          
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Provide detailed feedback for the apprentice. Be specific about what was done well and what needs improvement..."
            style={{
              width: '100%',
              minHeight: '180px',
              padding: '1.25rem',
              fontSize: '15px',
              lineHeight: '1.6',
              border: '2px solid #E5E7EB',
              borderRadius: '14px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              resize: 'vertical',
              background: 'white',
              color: '#1F2937',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#0066A2';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,102,162,0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            fontSize: '13px',
            color: '#6B7280'
          }}>
            <span>{notes.length} characters</span>
            {notes.length < 20 && (
              <span style={{ color: '#DC2626', fontWeight: 600 }}>
                Note: Consider adding more detailed feedback
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons - ONLY FOR PROFESSORS ON PENDING SUBMISSIONS */}
        {isProfessorView && !isReviewed ? (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            <div style={{
              display: 'flex',
              gap: '1.25rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => updateStatus('Approved')}
                disabled={updating}
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'white',
                  background: updating
                    ? 'linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)'
                    : 'linear-gradient(135deg, #00952E 0%, #10B981 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1.25rem 2.5rem',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  boxShadow: updating ? 'none' : '0 6px 20px rgba(0,149,46,0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  minWidth: '200px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  if (!updating) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,149,46,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!updating) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,149,46,0.3)';
                  }
                }}
              >
                <CheckCircle size={20} />
                Approve Submission
              </button>
              
              <button
                onClick={() => updateStatus('Needs Work')}
                disabled={updating}
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'white',
                  background: updating
                    ? 'linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)'
                    : 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1.25rem 2.5rem',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  boxShadow: updating ? 'none' : '0 6px 20px rgba(220,38,38,0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  minWidth: '200px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  if (!updating) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(220,38,38,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!updating) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(220,38,38,0.3)';
                  }
                }}
              >
                <XCircle size={20} />
                Request Revision
              </button>
            </div>
            
            {updating && (
              <div style={{
                marginTop: '1.5rem',
                textAlign: 'center',
                color: '#6B7280',
                fontSize: '14px',
                fontWeight: 600
              }}>
                <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                Updating submission and sending notification...
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            {isReviewed ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  background: submission.status === 'Approved'
                    ? 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)'
                    : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                  borderRadius: '16px',
                  padding: '3rem 2.5rem',
                  border: submission.status === 'Approved' 
                    ? '3px solid #10B981' 
                    : '3px solid #F59E0B',
                  maxWidth: '600px',
                  margin: '0 auto 2rem'
                }}>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: submission.status === 'Approved'
                      ? 'linear-gradient(135deg, #00952E 0%, #10B981 100%)'
                      : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    margin: '0 auto 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: submission.status === 'Approved'
                      ? '0 8px 24px rgba(0,149,46,0.3)'
                      : '0 8px 24px rgba(245,158,11,0.3)'
                  }}>
                    <Lock size={36} color="white" />
                  </div>
                  <h3 style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#004A69',
                    margin: '0 0 1rem 0'
                  }}>
                    Review Complete
                  </h3>
                  <div style={{
                    width: '48px',
                    height: '3px',
                    background: submission.status === 'Approved' ? '#10B981' : '#F59E0B',
                    margin: '0 auto 1.5rem',
                    borderRadius: '2px'
                  }}></div>
                  <p style={{
                    fontSize: '16px',
                    color: submission.status === 'Approved' ? '#065F46' : '#92400E',
                    margin: 0,
                    lineHeight: '1.7',
                    fontWeight: 500
                  }}>
                    This submission has been {submission.status === 'Approved' ? 'approved' : 'reviewed'}.<br />
                    The review is now locked and cannot be changed.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    if (dashboardToken) {
                      window.location.href = `/dashboard/${dashboardToken}`;
                    } else {
                      window.location.href = '/';
                    }
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
        )}

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
              Ã—
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

export default ReviewSubmission;