import nodemailer from "nodemailer";

export async function sendMail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  let transporter = nodemailer.createTransport({
    host: "smtp.ionos.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.NODE_MAIL_USER,
      pass: process.env.NODE_MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `wrkouts.xyz <${process.env.NODE_MAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
}
