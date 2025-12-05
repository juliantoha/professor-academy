import emailjs from 'emailjs-com';
import { v4 as uuidv4 } from 'uuid';

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

/**
 * Upload a base64 image to Cloudinary
 * @param base64Image - Base64 encoded image string
 * @param taskId - Unique identifier for the image
 * @returns Cloudinary secure URL
 */
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
// AIRTABLE OPERATIONS
// ============================================

/**
 * Save submission to Airtable Submissions table
 * @param submissionId - Unique submission identifier
 * @param data - Submission data (can be SubmissionData or ModuleSubmissionData)
 * @param screenshotUrls - Map of task IDs to Cloudinary URLs
 * @param moduleName - Optional module name for module-specific submissions
 */
export const saveToAirtable = async (
  submissionId: string,
  data: SubmissionData | ModuleSubmissionData,
  screenshotUrls: Record<string, string>,
  moduleName?: string
): Promise<void> => {
  const isModuleSubmission = 'moduleName' in data;
  
  const fields: any = {
    submissionId,
    studentName: data.studentName,
    apprenticeEmail: data.apprenticeEmail,
    professorEmail: data.professorEmail,
    operatingSystem: data.operatingSystem === 'mac' ? 'Mac' : 'Windows',
    screenshots: JSON.stringify(screenshotUrls),
    completedTasks: JSON.stringify(Object.keys(data.completedTasks).filter(key => data.completedTasks[key])),
    submittedAt: new Date().toISOString(),
    status: 'Pending'
  };

  // Add module-specific fields if this is a module submission
  if (isModuleSubmission) {
    fields.module = (data as ModuleSubmissionData).moduleName;
    fields.moduleNumber = (data as ModuleSubmissionData).moduleNumber;
    fields.phase = (data as ModuleSubmissionData).phase;
  }

  const response = await fetch(
    `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/${import.meta.env.VITE_AIRTABLE_TABLE_NAME}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Airtable Submissions error:', errorText);
    throw new Error('Failed to save submission to Airtable');
  }

  console.log('✓ Submission saved to Airtable');
};

/**
 * Update Progress table in Airtable
 * @param apprenticeEmail - Email of the apprentice
 * @param phase - Training phase (e.g., "Phase 1", "Phase 2")
 * @param module - Module name (e.g., "Computer Essentials")
 * @param submissionId - Unique submission identifier
 */
export const updateProgress = async (
  apprenticeEmail: string,
  phase: string,
  module: string,
  submissionId: string
): Promise<void> => {
  console.log(`Updating progress: ${phase} - ${module} for ${apprenticeEmail}`);
  
  try {
    const filterFormula = `AND({apprenticeEmail}='${apprenticeEmail}',{phase}='${phase}',{module}='${module}')`;
    
    const checkResponse = await fetch(
      `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Progress?filterByFormula=${encodeURIComponent(filterFormula)}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`
        }
      }
    );
    
    if (!checkResponse.ok) {
      const errorText = await checkResponse.text();
      console.error('Failed to check existing progress:', errorText);
      throw new Error('Failed to check existing progress records');
    }
    
    const existingRecords = await checkResponse.json();
    
    if (existingRecords.records.length > 0) {
      // Update existing record
      const recordId = existingRecords.records[0].id;
      console.log(`Updating existing progress record: ${recordId}`);
      
      const updateResponse = await fetch(
        `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Progress/${recordId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              Status: 'Completed',
              submissionId
            }
          })
        }
      );
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('Failed to update progress:', errorText);
        throw new Error('Failed to update progress record');
      }
      
      console.log(`✓ Updated progress for ${module}`);
    } else {
      // Create new record
      console.log(`Creating new progress record for ${module}`);
      
      const createResponse = await fetch(
        `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Progress`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              apprenticeEmail,
              phase,
              module,
              Status: 'Completed',
              submissionId
            }
          })
        }
      );
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('Failed to create progress:', errorText);
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

/**
 * 🆕 Send module completion email to professor
 * Uses the new module-specific EmailJS template
 * @param data - Module submission data
 * @param submissionId - Unique submission identifier
 */
export const sendModuleCompletionEmail = async (
  data: ModuleSubmissionData,
  submissionId: string
): Promise<void> => {
  const reviewUrl = `${window.location.origin}/review/${submissionId}`;
  
  const templateParams = {
    to_email: data.professorEmail,
    student_name: data.studentName,
    module_name: data.moduleName,
    module_number: data.moduleNumber,
    phase: data.phase,
    operating_system: data.operatingSystem === 'mac' ? 'macOS' : 'Windows',
    submitted_at: new Date().toLocaleString(),
    review_url: reviewUrl,
    task_count: Object.keys(data.completedTasks).filter(key => data.completedTasks[key]).length
  };

  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_MODULE_TEMPLATE_ID,
      templateParams
    );
    console.log(`✓ Module completion email sent to ${data.professorEmail}`);
  } catch (error) {
    console.error('Failed to send module completion email:', error);
    throw new Error('Failed to send email notification');
  }
};

/**
 * Send email to professor (legacy - for full training submissions)
 * @param data - Submission data
 * @param submissionId - Unique submission identifier
 */
export const sendEmailToProfessor = async (
  data: SubmissionData,
  submissionId: string
): Promise<void> => {
  const reviewUrl = `${window.location.origin}/review/${submissionId}`;
  
  const templateParams = {
    to_email: data.professorEmail,
    student_name: data.studentName,
    operating_system: data.operatingSystem === 'mac' ? 'macOS' : 'Windows',
    submitted_at: new Date().toLocaleString(),
    review_url: reviewUrl
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
    throw new Error('Failed to send email notification');
  }
};

/**
 * Send orientation completion email to professor
 * @param data - Orientation completion data
 */
export const sendOrientationEmail = async (
  data: OrientationData
): Promise<void> => {
  const templateParams = {
    to_email: data.professorEmail,
    student_name: data.apprenticeName,
    apprentice_email: data.apprenticeEmail,
    completed_at: new Date().toLocaleString(),
    phase: 'Phase 1 - Orientation'
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

/**
 * Mark Phase 1 Orientation as complete
 * @param data - Orientation completion data
 * @returns Submission ID
 */
export const markOrientationComplete = async (data: OrientationData): Promise<string> => {
  const submissionId = `orientation_${uuidv4()}`;
  
  console.log('=== Marking Orientation Complete ===');
  console.log('Submission ID:', submissionId);
  console.log('Apprentice:', data.apprenticeName, `(${data.apprenticeEmail})`);
  console.log('Professor:', data.professorEmail);

  try {
    const filterFormula = `AND({apprenticeEmail}='${data.apprenticeEmail}',{phase}='Phase 1',{module}='Orientation')`;
    
    const checkResponse = await fetch(
      `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Progress?filterByFormula=${encodeURIComponent(filterFormula)}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`
        }
      }
    );
    
    if (!checkResponse.ok) {
      const errorText = await checkResponse.text();
      console.error('Failed to check existing orientation progress:', errorText);
      throw new Error('Failed to check existing orientation records');
    }
    
    const existingRecords = await checkResponse.json();
    
    if (existingRecords.records.length > 0) {
      const recordId = existingRecords.records[0].id;
      console.log(`Updating existing orientation record: ${recordId}`);
      
      const updateResponse = await fetch(
        `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Progress/${recordId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              Status: 'Completed',
              submissionId,
              submittedAt: new Date().toISOString()
            }
          })
        }
      );
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('Failed to update orientation progress:', errorText);
        throw new Error('Failed to update orientation record');
      }
      
      console.log('✓ Updated existing orientation record');
    } else {
      console.log('Creating new orientation record');
      
      const createResponse = await fetch(
        `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Progress`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              apprenticeEmail: data.apprenticeEmail,
              phase: 'Phase 1',
              module: 'Orientation',
              Status: 'Completed',
              submissionId,
              submittedAt: new Date().toISOString()
            }
          })
        }
      );
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('Failed to create orientation progress:', errorText);
        throw new Error('Failed to create orientation record');
      }
      
      console.log('✓ Created orientation record');
    }

    await sendOrientationEmail(data);

    console.log('=== Orientation Complete ✓ ===');
    return submissionId;
    
  } catch (error) {
    console.error('=== Orientation Failed ✗ ===');
    console.error('Error:', error);
    throw error;
  }
};

/**
 * 🆕 Submit individual module completion
 * This is the main function to use for Phase 2 module submissions
 * @param data - Module submission data
 * @returns Submission ID
 */
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

    // Step 2: Save to Airtable Submissions
    console.log('\n--- Step 2: Saving to Submissions Table ---');
    await saveToAirtable(submissionId, data, screenshotUrls, data.moduleName);

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

/**
 * Submit training (legacy - kept for backward compatibility)
 * @param data - Submission data
 * @returns Submission ID
 */
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
    await saveToAirtable(submissionId, data, screenshotUrls);

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