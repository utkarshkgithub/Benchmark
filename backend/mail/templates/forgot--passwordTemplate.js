export const forgotPasswordTemplate = (otp) => {
  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>OTP Verification</title>
    <style>
      body { font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; }
      .container { max-width: 600px; margin: 40px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
      .title { font-size: 22px; font-weight: bold; margin-bottom: 20px; color: #2e86de; }
      .message { font-size: 16px; margin-bottom: 20px; }
      .otp { font-size: 28px; font-weight: bold; color: #e67e22; margin: 20px 0; }
      .support { font-size: 14px; color: #999; margin-top: 30px; }
      a { color: #2e86de; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="title">OTP Verification</div>
      <p class="message">Hello,</p>
      <p class="message">Use the following OTP to reset your password:</p>
      <div class="otp">${otp}</div>
      <p class="message">This OTP will expire in 5 minutes.</p>
      <div class="support">
        If you didn't request a password reset, you can safely ignore this email.<br/>
        Need assistance? Contact us at <a href="mailto:iiitbhbenchmark@gmail.com">iiitbhbenchmark@gmail.com</a>.
      </div>
    </div>
  </body>
  </html>`;
};
