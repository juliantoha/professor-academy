import { Resend } from 'resend';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const data = JSON.parse(event.body);

  const emailHtml = `
    <h2>New Training Submission</h2>
    <p><strong>Student Progress:</strong> ${data.progress}%</p>
    <p><strong>Operating System:</strong> ${data.operatingSystem}</p>
    <p><strong>Completed Tasks:</strong></p>
    <ul>
      ${JSON.parse(data.completedTasks).map(task => `<li>${task}</li>`).join('')}
    </ul>
    <p><strong>Screenshots Uploaded:</strong> ${data.screenshotCount}</p>
    <p><strong>Submitted:</strong> ${new Date(data.submittedAt).toLocaleString()}</p>
  `;

  try {
    await resend.emails.send({
      from: 'Oclef Training <training@studio.oclef.com>',
      to: data.professorEmail,
      subject: 'New Professor Academy Training Submission',
      html: emailHtml,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};