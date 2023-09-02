import nodemailer from "nodemailer";
export const sendEmail = async ({ to, subject, html, attachments }) => {
  // sender
  const trasporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAILPASS,
    },
  });
  // reciever
  const info = await trasporter.sendMail({
    from: `"Route Academy <${process.env.EMAIL}>"`,
    to,
    subject,
    html,
    attachments,
  });

  return info.accepted.length > 0 ? true : false;
};
