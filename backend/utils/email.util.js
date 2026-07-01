const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    });

    const sendHighRiskAlert = async ({ counselorEmail, userName, userEmail, riskLevel, summary, moodScore }) => {
    try {
        await transporter.sendMail({
        from: `MindCare System <${process.env.EMAIL_USER}>`,
        to: counselorEmail,
        subject: `⚠️ High Risk Alert — ${userName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
            <div style="background: #16a34a; padding: 20px 24px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 20px;">🧠 MindCare — Risk Alert</h1>
            </div>
            <div style="background: white; padding: 24px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
                <p style="color: #dc2626; font-weight: bold; margin: 0;">⚠️ ${riskLevel} Risk Level Detected</p>
                </div>
                <h2 style="color: #111827; font-size: 16px; margin-bottom: 4px;">User: ${userName}</h2>
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">${userEmail}</p>
                <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;"><strong>Mood Score:</strong> ${moodScore}/10</p>
                <p style="margin: 0; font-size: 14px; color: #374151;"><strong>AI Assessment:</strong> ${summary}</p>
                </div>
                <p style="color: #6b7280; font-size: 13px;">Please log in to the MindCare counselor dashboard to review and resolve this alert.</p>
                <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">MindCare Mental Health System — Automated Alert</p>
                </div>
            </div>
            </div>
        `,
        });
        console.log(`✅ Alert email sent to ${counselorEmail}`);
    } catch (err) {
        console.error('Email send error:', err.message);
    }
};

module.exports = { sendHighRiskAlert };