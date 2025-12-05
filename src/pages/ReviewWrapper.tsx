import { useParams } from 'react-router-dom';
import ReviewSubmission from './ReviewSubmission';

const ReviewWrapper = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  
  if (!submissionId) {
    return (
      <div style={{ 
        padding: '3rem', 
        textAlign: 'center',
        fontFamily: 'Lato, sans-serif'
      }}>
        <h1 style={{ color: '#DC2626' }}>Invalid Submission ID</h1>
        <p style={{ color: '#6B7280' }}>Please check the URL and try again.</p>
      </div>
    );
  }
  
  return <ReviewSubmission submissionId={submissionId} />;
};

export default ReviewWrapper;