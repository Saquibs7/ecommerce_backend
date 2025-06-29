import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,       
      service: process.env.SMTP_SERVICE,   
      port: Number(process.env.SMTP_PORT), 
      secure: true,                        
      auth: {
        user: process.env.SMTP_MAIL,       
        pass: process.env.SMTP_PASSWORD,   
      },
    });

    await transporter.verify(); // Optional: test SMTP connection
    console.log(" SMTP server is ready to send emails");

    const options = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject,
      html: message,
    };

    await transporter.sendMail(options);
    console.log(`Email sent to ${email}`);
  } catch (err) {
    console.error("Email sending failed:", err);
    return next(new ErrorHandler("failed to send verification code ", 500));
  }
};
