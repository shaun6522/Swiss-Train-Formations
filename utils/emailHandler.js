import nodemailer from "nodemailer";

export async function sendContactEmail(name, email, message) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Website Contact"`,
      to: process.env.RECEIVER_EMAIL,
      subject: `Contact form message from ${name}`,
      text: email + ": " + message,
    });
    return true;
  } catch (err) {
    return err;
  }
}
