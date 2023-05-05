import { Client, SendEmailV3_1 } from "node-mailjet";

const mailjet = new Client({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_SECRET_KEY,
});

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) => {
  const email: SendEmailV3_1.Body = {
    Messages: [
      {
        From: {
          Email: process.env.EMAIL_NAME as string,
        },
        To: [
          {
            Email: to,
          },
        ],
        Subject: subject,
        HTMLPart: html,
        TextPart: text,
      },
    ],
  };

  await mailjet
    .post("send", {
      version: "v3.1",
    })
    .request(email);
};
