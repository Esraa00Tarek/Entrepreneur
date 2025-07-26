// utils/emailTemplates.js

export const generateStatusEmail = (fullName, status, rejectionReason = '') => {
    let subject = '';
    let html = '';
  
    switch (status) {
      case 'pending':
        subject = 'Your registration on Elevante is under review';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #1976d2;">Hello ${fullName},</h2>
            <p>Thank you for registering on <strong>Elevante</strong>.</p>
            <p>Your profile is currently under review by our admin team. You will receive another email once your account is reviewed.</p>
            <p>We appreciate your interest in joining us.</p>
            <br/>
            <p>Best regards,<br><strong>Elevante Team</strong></p>
          </div>
        `;
        break;
  
      case 'approved':
        subject = 'Your Elevante account has been approved';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #1976d2;">Welcome ${fullName},</h2>
            <p>We are pleased to inform you that your account has been successfully approved.</p>
            <p>You can now log in and start using the platform.</p>
            <br/>
            <p>Wishing you a great journey,<br><strong>Elevante Team</strong></p>
          </div>
        `;
        break;
  
      case 'rejected':
        subject = 'Your Elevante account has been rejected';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: red;">Hello ${fullName},</h2>
            <p>We regret to inform you that your account registration has been rejected.</p>
            <p><strong>Reason:</strong> ${rejectionReason}</p>
            <p>You are welcome to revise your information and try again if applicable.</p>
            <br/>
            <p>If you have any questions, feel free to reach out.<br><strong>Elevante Team</strong></p>
          </div>
        `;
        break;
  
      default:
        subject = 'Notification from Elevante';
        html = `
          <div style="font-family: Arial, sans-serif;">
            <p>Hello ${fullName},</p>
            <p>There has been an update related to your account. Please log in to the platform for more details.</p>
          </div>
        `;
    }
  
    return { subject, html };
  };