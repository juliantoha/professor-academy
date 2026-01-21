import emailjs from 'emailjs-com';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

// Initialize EmailJS with public key
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

// ============================================
// INTERFACES
// ============================================

export interface SubmissionData {
  studentName: string;
  apprenticeEmail: string;
  professorEmail: string;
  operatingSystem: 'mac' | 'windows';
  completedTasks: Record<string, boolean>;
  uploadedScreenshots: Record<string, string>;
}

export interface ModuleSubmissionData {
  studentName: string;
  apprenticeEmail: string;
  professorEmail: string;
  operatingSystem: 'mac' | 'windows';
  moduleName: string;
  moduleNumber: string;
  phase: string;
  completedTasks: Record<string, boolean>;
  uploadedScreenshots: Record<string, string>;
}

export interface OrientationData {
  apprenticeName: string;
  apprenticeEmail: string;
  professorEmail: string;
}

// ============================================
// CLOUDINARY UPLOAD
// ============================================

export const uploadToCloudinary = async (base64Image: string, taskId: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', base64Image);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'oclef-training');
  formData.append('public_id', taskId);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Cloudinary upload failed:', errorText);
    throw new Error('Failed to upload image to Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
};

// ============================================
// SUPABASE OPERATIONS
// ============================================

export const saveToSupabase = async (
  submissionId: string,
  data: SubmissionData | ModuleSubmissionData,
  screenshotUrls: Record<string, string>
): Promise<void> => {
  const isModuleSubmission = 'moduleName' in data;

  const record: any = {
    submissionId,
    studentName: data.studentName,
    apprenticeEmail: data.apprenticeEmail,
    professorEmail: data.professorEmail,
    operatingSystem: data.operatingSystem === 'mac' ? 'Mac' : 'Windows',
    screenshotUrls: JSON.stringify(screenshotUrls),
    completedTasks: JSON.stringify(Object.keys(data.completedTasks).filter(key => data.completedTasks[key])),
    submittedAt: new Date().toISOString(),
    status: 'Pending'
  };

  if (isModuleSubmission) {
    record.moduleName = (data as ModuleSubmissionData).moduleName;
    record.moduleNumber = (data as ModuleSubmissionData).moduleNumber;
    record.phase = (data as ModuleSubmissionData).phase;
  }

  const { error } = await supabase
    .from('submissions')
    .insert(record);

  if (error) {
    console.error('Supabase Submissions error:', error);
    throw new Error('Failed to save submission to database');
  }

  console.log('✓ Submission saved to Supabase');
};

export const updateProgress = async (
  apprenticeEmail: string,
  phase: string,
  module: string,
  submissionId: string
): Promise<void> => {
  console.log(`Updating progress: ${phase} - ${module} for ${apprenticeEmail}`);

  try {
    // Check if record exists
    const { data: existing, error: fetchError } = await supabase
      .from('progress')
      .select('*')
      .eq('apprenticeEmail', apprenticeEmail)
      .eq('phase', phase)
      .eq('module', module)
      .maybeSingle();

    if (fetchError) {
      console.error('Failed to check existing progress:', fetchError);
      throw new Error('Failed to check existing progress records');
    }

    if (existing) {
      // Update existing record by composite key
      const { error: updateError } = await supabase
        .from('progress')
        .update({
          Status: 'Submitted',
          submissionId,
          submittedAt: new Date().toISOString()
        })
        .eq('apprenticeEmail', apprenticeEmail)
        .eq('phase', phase)
        .eq('module', module);

      if (updateError) {
        console.error('Failed to update progress:', updateError);
        throw new Error('Failed to update progress record');
      }
      console.log(`✓ Updated progress for ${module}`);
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('progress')
        .insert({
          apprenticeEmail,
          phase,
          module,
          Status: 'Submitted',
          submissionId,
          submittedAt: new Date().toISOString()
        });

      if (insertError) {
        console.error('Failed to create progress:', insertError);
        throw new Error('Failed to create progress record');
      }
      console.log(`✓ Created progress record for ${module}`);
    }
  } catch (error) {
    console.error(`Error updating progress for ${module}:`, error);
    throw error;
  }
};

// ============================================
// EMAIL FUNCTIONS
// ============================================

export const sendModuleCompletionEmail = async (
  data: ModuleSubmissionData,
  submissionId: string
): Promise<void> => {
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin || 'https://academy.oclef.com';
  const reviewUrl = `${baseUrl}/review/${submissionId}?review=true`;
  const taskCount = Object.keys(data.completedTasks || {}).filter(key => data.completedTasks[key]).length;

  const reviewUrl = `${window.location.origin}/review/${submissionId}?review=true`;
  const taskCount = Object.keys(data.completedTasks || {}).filter(key => data.completedTasks[key]).length;
  
  const templateParams = {
    to_email: data.professorEmail,
    student_name: data.studentName,
    apprentice_email: data.apprenticeEmail,
    module_name: data.moduleName,
    module_number: data.moduleNumber,
    phase: data.phase,
    operating_system: data.operatingSystem === 'mac' ? 'Mac' : 'Windows',
    task_count: `${taskCount} tasks`,
    submitted_at: new Date().toLocaleString(),
    review_url: reviewUrl
  };

  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_MODULE_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams
    );
    console.log('✓ Module completion email sent to professor');
  } catch (error) {
    console.error('Failed to send module email:', error);
    console.warn('⚠️ Continuing without email notification');
  }
};

export const sendEmailToProfessor = async (
  data: SubmissionData,
  submissionId: string
): Promise<void> => {
  const templateParams = {
    to_email: data.professorEmail,
    student_name: data.studentName,
    apprentice_email: data.apprenticeEmail,
    submission_id: submissionId,
    completed_at: new Date().toLocaleString()
  };

  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams
    );
    console.log('✓ Email sent to professor');
  } catch (error) {
    console.error('Failed to send email:', error);
    console.warn('⚠️ Continuing without email notification');
  }
};

export const sendOrientationEmail = async (
  data: OrientationData
): Promise<void> => {
  const templateParams = {
    to_email: data.professorEmail,
    student_name: data.apprenticeName,
    apprentice_email: data.apprenticeEmail,
    module_name: 'Orientation',
    module_number: '1.0',
    phase: 'Phase 1 - Orientation',
    operating_system: 'N/A',
    task_count: 'Orientation Complete',
    submitted_at: new Date().toLocaleString(),
    review_url: `${window.location.origin}/dashboard`
  };

  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_ORIENTATION_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams
    );
    console.log('✓ Orientation completion email sent to professor');
  } catch (error) {
    console.error('Failed to send orientation email:', error);
    console.warn('⚠️ Continuing without email notification');
  }
};

// ============================================
// SUBMISSION HANDLERS
// ============================================

export const markOrientationComplete = async (data: OrientationData): Promise<string> => {
  const submissionId = `orientation_${uuidv4()}`;

  console.log('=== Marking Orientation Complete ===');
  console.log('Submission ID:', submissionId);
  console.log('Apprentice:', data.apprenticeName, `(${data.apprenticeEmail})`);
  console.log('Professor:', data.professorEmail);

  try {
    // Check if orientation record exists
    const { data: existing, error: fetchError } = await supabase
      .from('progress')
      .select('*')
      .eq('apprenticeEmail', data.apprenticeEmail)
      .eq('phase', 'Phase 1')
      .eq('module', 'Orientation')
      .maybeSingle();

    if (fetchError) {
      console.error('Failed to check existing orientation progress:', fetchError);
      throw new Error('Failed to check existing orientation records');
    }

    if (existing) {
      // Update existing record by composite key
      const { error: updateError } = await supabase
        .from('progress')
        .update({
          Status: 'Completed',
          submissionId,
          submittedAt: new Date().toISOString()
        })
        .eq('apprenticeEmail', data.apprenticeEmail)
        .eq('phase', 'Phase 1')
        .eq('module', 'Orientation');

      if (updateError) {
        console.error('Failed to update orientation progress:', updateError);
        throw new Error('Failed to update orientation record');
      }
      console.log('✓ Updated existing orientation record');
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('progress')
        .insert({
          apprenticeEmail: data.apprenticeEmail,
          phase: 'Phase 1',
          module: 'Orientation',
          Status: 'Completed',
          submissionId,
          submittedAt: new Date().toISOString()
        });

      if (insertError) {
        console.error('Failed to create orientation progress:', insertError);
        throw new Error('Failed to create orientation record');
      }
      console.log('✓ Created orientation record');
    }


    console.log('=== Orientation Complete ✓ ===');
    return submissionId;

  } catch (error) {
    console.error('=== Orientation Failed ✗ ===');
    console.error('Error:', error);
    throw error;
  }
};

export const submitModule = async (data: ModuleSubmissionData): Promise<string> => {
  const submissionId = `${data.moduleNumber.replace('.', '_')}_${uuidv4()}`;

  console.log('=== Starting Module Submission ===');
  console.log('Submission ID:', submissionId);
  console.log('Module:', `${data.moduleNumber} - ${data.moduleName}`);
  console.log('Apprentice:', data.studentName, `(${data.apprenticeEmail})`);
  console.log('Professor:', data.professorEmail);

  try {
    // Step 1: Upload all screenshots to Cloudinary
    console.log('\n--- Step 1: Uploading Screenshots ---');
    const screenshotUrls: Record<string, string> = {};
    const screenshotCount = Object.keys(data.uploadedScreenshots).length;

    let uploadedCount = 0;
    for (const [taskId, base64Image] of Object.entries(data.uploadedScreenshots)) {
      try {
        const url = await uploadToCloudinary(base64Image, `${submissionId}_${taskId}`);
        screenshotUrls[taskId] = url;
        uploadedCount++;
        console.log(`✓ Uploaded ${uploadedCount}/${screenshotCount}: ${taskId}`);
      } catch (error) {
        console.error(`Failed to upload screenshot for ${taskId}:`, error);
        throw new Error(`Failed to upload screenshot for task ${taskId}`);
      }
    }

    // Step 2: Save to Supabase Submissions
    console.log('\n--- Step 2: Saving to Submissions Table ---');
    await saveToSupabase(submissionId, data, screenshotUrls);

    // Step 3: Update Progress table
    console.log('\n--- Step 3: Updating Progress Table ---');
    await updateProgress(data.apprenticeEmail, data.phase, data.moduleName, submissionId);

    // Step 4: Send module completion email
    console.log('\n--- Step 4: Sending Module Completion Email ---');
    await sendModuleCompletionEmail(data, submissionId);

    console.log('\n=== Module Submission Complete ✓ ===');
    return submissionId;

  } catch (error) {
    console.error('\n=== Module Submission Failed ✗ ===');
    console.error('Error:', error);
    throw error;
  }
};

export const submitTraining = async (data: SubmissionData): Promise<string> => {
  const submissionId = uuidv4();

  console.log('=== Starting Training Submission ===');
  console.log('Submission ID:', submissionId);
  console.log('Apprentice:', data.studentName, `(${data.apprenticeEmail})`);
  console.log('Professor:', data.professorEmail);

  try {
    console.log('\n--- Step 1: Uploading Screenshots ---');
    const screenshotUrls: Record<string, string> = {};
    const screenshotCount = Object.keys(data.uploadedScreenshots).length;

    let uploadedCount = 0;
    for (const [taskId, base64Image] of Object.entries(data.uploadedScreenshots)) {
      try {
        const url = await uploadToCloudinary(base64Image, `${submissionId}_${taskId}`);
        screenshotUrls[taskId] = url;
        uploadedCount++;
        console.log(`✓ Uploaded ${uploadedCount}/${screenshotCount}: ${taskId}`);
      } catch (error) {
        console.error(`Failed to upload screenshot for ${taskId}:`, error);
        throw new Error(`Failed to upload screenshot for task ${taskId}`);
      }
    }

    console.log('\n--- Step 2: Saving to Submissions Table ---');
    await saveToSupabase(submissionId, data, screenshotUrls);

    console.log('\n--- Step 3: Sending Email ---');
    await sendEmailToProfessor(data, submissionId);

    console.log('\n=== Submission Complete ✓ ===');
    return submissionId;

  } catch (error) {
    console.error('\n=== Submission Failed ✗ ===');
    console.error('Error:', error);
    throw error;
  }
};
