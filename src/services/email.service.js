import resend from "../config/resend.js";
import env from '../config/environment.js';

export const sendOtpEmail = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Your Verification OTP",
      html: `
      <div style="font-family:Arial;padding:30px">
          <h2>AISerbisyos Studios</h2>

          <p>Your verification code is</p>

          <h1 style="
              letter-spacing:8px;
              color:#2563eb;
          ">
              ${otp}
          </h1>

          <p>
              This OTP is valid for
              <b>10 minutes</b>.
          </p>

          <p>
              Do not share this OTP with anyone.
          </p>

          <hr>

          <small>
              Team AISerbisyos Studios
          </small>
      </div>
      `,
    });

    if (error) {
      console.log(error);
      throw error;
    }

    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};