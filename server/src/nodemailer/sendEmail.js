const nodemailer = require("nodemailer");

module.exports = async (name, email, subject, link, newUser) => {
  try {
    const emailToSend = newUser
      ? `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; text-align: left;">
    <h2 style="margin-bottom: 10px;">Verify Your Email for Typer</h2>
    <p>Hello ${name},</p>
    <p>Thank you for signing up for Typer! To complete your registration, please verify your email by clicking the button below:</p>
    <p>
        <a href="${link}" 
           style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
            Verify Account
        </a>
    </p>
    <p>If you did not sign up for Typer, you can safely ignore this email.</p>
    <p>This link will expire in <b>60 minutes</b> for security purposes.</p>
    <p>Best regards,<br>The Typer Team</p>
</body>
</html>`
      : `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reset Password</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; text-align: left;">
    <h2 style="margin-bottom: 10px;">Reset Your Password For Your Typer Account</h2>
    <p>Hello ${name},</p>
    <p>Click the below button to reset your password:</p>
    <p>
        <a href="${link}" 
           style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
            Reset Password
        </a>
    </p>
    <p>If you did not sign up for Typer, you can safely ignore this email.</p>
    <p>This link will expire in <b>60 minutes</b> for security purposes.</p>
    <p>Best regards,<br>The Typer Team</p>
</body>
</html>`;
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: subject,
      html: emailToSend,
    });
  } catch (err) {
    console.log(err);
  }
};
