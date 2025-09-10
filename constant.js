export const mailOptionsHandle = (email, code, firstName) => {
    return {
        from: process.env.EMAIL_USER,  // sender address
        to: email,    // list of receivers
        subject: "welcome to portfolio generator", // subject line
        text: `hello ${firstName || ""}, this is your verification code: ${code}. 
        this code will expire after 5 minutes. 
        thanks for signing up to portfolio generator!`, // plain text body

        html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px;">
      <h2 style="color: #2c3e50;">welcome to <span style="color:#007bff;">portfolio generator</span> </h2>
      <p>thanks for signing up! please use the verification code below to complete your registration:</p>
      <div style="font-size: 24px; font-weight: bold; color: #007bff; margin: 20px 0;">${code}</div>
      <p style="color: #e74c3c;"> note: this code will expire after <strong>5 minutes</strong>.</p>
      <p>if you didn’t request this, you can safely ignore this email.</p>
      <hr />
      <small style="color:#999;">portfolio generator team</small>
    </div>
  `, // 
    }
}