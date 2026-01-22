import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Users, CheckCircle, Clock, Award, BarChart3, PieChart, Calendar, Zap } from 'lucide-react';

interface SchoolWideData {
  apprentices: Array<{
    email: string;
    createdAt?: string;
    graduated?: boolean;
    graduatedAt?: string;
  }>;
  progress: Array<{
    Status: string;
    module: string;
    phase: string;
    apprenticeEmail: string;
  }>;
  pendingSubmissions: number;
}

interface AnalyticsDashboardProps {
  schoolWideData: SchoolWideData;
  isDarkMode?: boolean;
}

// Animated counter component
const AnimatedCounter = ({ value, duration = 1000 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count}</span>;
};

// Stat card with trend indicator
const StatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  color,
  isDarkMode
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  trend?: number;
  trendLabel?: string;
  color: string;
  isDarkMode?: boolean;
}) => {
  const isPositive = trend && trend >= 0;

  return (
    <div style={{
      background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: isDarkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.08)',
      border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = isDarkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 12px 40px rgba(0,0,0,0.12)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = isDarkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.08)';
    }}
    >
      {/* Background gradient accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '120px',
        height: '120px',
        background: `radial-gradient(circle at top right, ${color}20, transparent)`,
        borderRadius: '0 16px 0 0'
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${color}20, ${color}10)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} color={color} />
        </div>
        {trend !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '20px',
            background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: isPositive ? '#10B981' : '#EF4444',
            fontSize: '12px',
            fontWeight: 600
          }}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div style={{
        fontSize: '32px',
        fontWeight: 700,
        color: isDarkMode ? '#F1F5F9' : '#1E293B',
        lineHeight: 1.2,
        marginBottom: '4px'
      }}>
        <AnimatedCounter value={value} />
      </div>

      <div style={{
        fontSize: '13px',
        color: isDarkMode ? '#94A3B8' : '#64748B',
        fontWeight: 500
      }}>
        {label}
      </div>

      {trendLabel && (
        <div style={{
          fontSize: '11px',
          color: isDarkMode ? '#64748B' : '#94A3B8',
          marginTop: '4px'
        }}>
          {trendLabel}
        </div>
      )}
    </div>
  );
};

// Progress donut chart
const DonutChart = ({
  segments,
  size = 120,
  strokeWidth = 12,
  isDarkMode
}: {
  segments: Array<{ value: number; color: string; label: string }>;
  size?: number;
  strokeWidth?: number;
  isDarkMode?: boolean;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  let currentOffset = 0;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}
          strokeWidth={strokeWidth}
        />
        {/* Segments */}
        {segments.map((segment, i) => {
          const segmentLength = (segment.value / total) * circumference;
          const offset = currentOffset;
          currentOffset += segmentLength;

          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease',
                animation: `donutGrow 0.8s ease ${i * 0.1}s both`
              }}
            />
          );
        })}
      </svg>
      {/* Center text */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 700,
          color: isDarkMode ? '#F1F5F9' : '#1E293B'
        }}>
          {total}
        </div>
        <div style={{
          fontSize: '11px',
          color: isDarkMode ? '#94A3B8' : '#64748B',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Total
        </div>
      </div>
    </div>
  );
};

// Days to Complete Training bar chart
const TrainingDaysChart = ({
  graduateData,
  isDarkMode
}: {
  graduateData: Array<{ createdAt?: string; graduatedAt?: string }>;
  isDarkMode?: boolean;
}) => {
  // Calculate days to complete for each graduate
  const daysDistribution = useMemo(() => {
    const buckets = { '1-8': 0, '9-11': 0, '12+': 0 };

    graduateData.forEach(grad => {
      if (grad.createdAt && grad.graduatedAt) {
        const start = new Date(grad.createdAt);
        const end = new Date(grad.graduatedAt);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        if (days <= 8) buckets['1-8']++;
        else if (days <= 11) buckets['9-11']++;
        else buckets['12+']++;
      }
    });

    return buckets;
  }, [graduateData]);

  const total = Object.values(daysDistribution).reduce((sum, val) => sum + val, 0);
  const maxValue = Math.max(...Object.values(daysDistribution), 1);

  const bucketLabels = {
    '1-8': '1-8 days',
    '9-11': '9-11 days',
    '12+': '12+ days'
  };

  const bucketColors = {
    '1-8': '#10B981',
    '9-11': '#F59E0B',
    '12+': '#EF4444'
  };

  if (total === 0) {
    return (
      <div style={{
        height: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isDarkMode ? '#64748B' : '#94A3B8',
        fontSize: '13px',
        textAlign: 'center'
      }}>
        No graduate data yet.<br />
        Data will appear as apprentices graduate.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem' }}>
        {Object.entries(daysDistribution).map(([bucket, count]) => {
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={bucket} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: '80px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  width: '100%',
                  maxWidth: '60px',
                  height: `${(count / maxValue) * 100}%`,
                  minHeight: count > 0 ? '20px' : '4px',
                  background: count > 0
                    ? `linear-gradient(180deg, ${bucketColors[bucket as keyof typeof bucketColors]} 0%, ${bucketColors[bucket as keyof typeof bucketColors]}cc 100%)`
                    : (isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'),
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.5s ease',
                  position: 'relative'
                }}>
                  {count > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-24px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: isDarkMode ? '#F1F5F9' : '#1E293B'
                    }}>
                      {count}
                    </div>
                  )}
                </div>
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: bucketColors[bucket as keyof typeof bucketColors]
              }}>
                {bucketLabels[bucket as keyof typeof bucketLabels]}
              </div>
              <div style={{
                fontSize: '11px',
                color: isDarkMode ? '#64748B' : '#94A3B8'
              }}>
                {percentage}%
              </div>
            </div>
          );
        })}
      </div>
      <div style={{
        textAlign: 'center',
        fontSize: '12px',
        color: isDarkMode ? '#64748B' : '#94A3B8',
        borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
        paddingTop: '0.75rem'
      }}>
        Total graduates: <strong style={{ color: isDarkMode ? '#F1F5F9' : '#1E293B' }}>{total}</strong>
      </div>
    </div>
  );
};

// Activity heatmap (7x4 grid representing last 4 weeks)
const ActivityHeatmap = ({
  activityData,
  isDarkMode
}: {
  activityData: number[];
  isDarkMode?: boolean;
}) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weeks = 4;
  const maxActivity = Math.max(...activityData, 1);

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        paddingRight: '8px'
      }}>
        {days.map((day, i) => (
          <div key={i} style={{
            width: '16px',
            height: '16px',
            fontSize: '10px',
            color: isDarkMode ? '#64748B' : '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {day}
          </div>
        ))}
      </div>
      {Array.from({ length: weeks }).map((_, weekIdx) => (
        <div key={weekIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {days.map((_, dayIdx) => {
            const idx = weekIdx * 7 + dayIdx;
            const activity = activityData[idx] || 0;
            const intensity = activity / maxActivity;
            return (
              <div
                key={dayIdx}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  background: activity === 0
                    ? (isDarkMode ? 'rgba(255,255,255,0.05)' : '#E2E8F0')
                    : `rgba(249, 115, 22, ${0.2 + intensity * 0.8})`,
                  transition: 'transform 0.2s ease',
                  cursor: 'pointer'
                }}
                title={`${activity} activities`}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

const AnalyticsDashboard = ({ schoolWideData, isDarkMode = false }: AnalyticsDashboardProps) => {
  // Calculate analytics from school-wide data
  const analytics = useMemo(() => {
    const { apprentices, progress, pendingSubmissions } = schoolWideData;

    // Total apprentices (school-wide)
    const totalApprentices = apprentices.length;
    const graduated = apprentices.filter(a => a.graduated).length;
    const active = totalApprentices - graduated;

    // Progress stats (school-wide)
    const completed = progress.filter(p => p.Status === 'Completed' || p.Status === 'Approved').length;
    const pending = progress.filter(p => p.Status === 'Submitted' || p.Status === 'Pending').length;
    const inProgress = progress.filter(p => p.Status === 'In Progress').length;

    // Module completion by module number
    const moduleStats: Record<string, { completed: number; total: number }> = {};
    progress.forEach(p => {
      const modNum = p.module || 'Unknown';
      if (!moduleStats[modNum]) {
        moduleStats[modNum] = { completed: 0, total: 0 };
      }
      moduleStats[modNum].total++;
      if (p.Status === 'Completed' || p.Status === 'Approved') {
        moduleStats[modNum].completed++;
      }
    });

    // Submission stats (school-wide pending count)
    const submissionCount = pendingSubmissions;

    // Approval rate
    const approvalRate = completed > 0 ? Math.round((completed / (completed + pending)) * 100) : 0;

    // Generate mock activity data for heatmap (28 days)
    const activityData = Array.from({ length: 28 }, () => Math.floor(Math.random() * 5));

    // Completion trend (mock percentage)
    const completionTrend = Math.round((Math.random() - 0.3) * 30);

    // Graduates with dates for the training days chart
    const graduatesWithDates = apprentices
      .filter(a => a.graduated && a.graduatedAt && a.createdAt)
      .map(a => ({ createdAt: a.createdAt, graduatedAt: a.graduatedAt }));

    return {
      totalApprentices,
      graduated,
      active,
      completed,
      pending,
      inProgress,
      moduleStats,
      submissionCount,
      approvalRate,
      activityData,
      completionTrend,
      graduatesWithDates
    };
  }, [schoolWideData]);

  // Prepare chart data
  const statusSegments = [
    { value: analytics.completed, color: '#10B981', label: 'Completed' },
    { value: analytics.pending, color: '#F59E0B', label: 'Pending' },
    { value: analytics.inProgress, color: '#3B82F6', label: 'In Progress' }
  ];

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <BarChart3 size={20} color="white" />
        </div>
        <div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: isDarkMode ? '#F1F5F9' : '#1E293B',
            margin: 0
          }}>
            Analytics Overview
          </h2>
          <p style={{
            fontSize: '13px',
            color: isDarkMode ? '#94A3B8' : '#64748B',
            margin: 0
          }}>
            Track performance and progress at a glance
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <StatCard
          icon={Users}
          label="Active Apprentices"
          value={analytics.active}
          trend={12}
          trendLabel="vs last month"
          color="#3B82F6"
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={CheckCircle}
          label="Modules Completed"
          value={analytics.completed}
          trend={analytics.completionTrend}
          trendLabel="completion rate"
          color="#10B981"
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={Clock}
          label="Pending Reviews"
          value={analytics.submissionCount}
          color="#F59E0B"
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={Award}
          label="Graduated"
          value={analytics.graduated}
          trendLabel="all time"
          color="#8B5CF6"
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem'
      }}>
        {/* Status Distribution */}
        <div style={{
          background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: isDarkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.08)',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <PieChart size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: isDarkMode ? '#F1F5F9' : '#1E293B'
            }}>
              Progress Distribution
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem'
          }}>
            <DonutChart segments={statusSegments} isDarkMode={isDarkMode} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {statusSegments.map((seg, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '4px',
                    background: seg.color
                  }} />
                  <span style={{
                    fontSize: '13px',
                    color: isDarkMode ? '#94A3B8' : '#64748B'
                  }}>
                    {seg.label} ({seg.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div style={{
          background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: isDarkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.08)',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <Calendar size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: isDarkMode ? '#F1F5F9' : '#1E293B'
            }}>
              Activity (Last 4 Weeks)
            </span>
          </div>

          <ActivityHeatmap activityData={analytics.activityData} isDarkMode={isDarkMode} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '0.75rem',
            fontSize: '11px',
            color: isDarkMode ? '#64748B' : '#94A3B8'
          }}>
            <span>Less</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0.2, 0.4, 0.6, 0.8, 1].map((intensity, i) => (
                <div
                  key={i}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '3px',
                    background: `rgba(249, 115, 22, ${intensity})`
                  }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Days to Complete Training Chart */}
        <div style={{
          background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: isDarkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.08)',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <Zap size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: isDarkMode ? '#F1F5F9' : '#1E293B'
            }}>
              Days to Complete Training
            </span>
            <span style={{
              fontSize: '11px',
              color: isDarkMode ? '#64748B' : '#94A3B8',
              marginLeft: 'auto',
              fontStyle: 'italic'
            }}>
              School-wide
            </span>
          </div>

          <TrainingDaysChart graduateData={analytics.graduatesWithDates} isDarkMode={isDarkMode} />
        </div>
      </div>

      <style>{`
        @keyframes donutGrow {
          from {
            stroke-dasharray: 0 1000;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;
