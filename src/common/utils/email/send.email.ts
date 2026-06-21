import Mail from 'nodemailer/lib/mailer';
import nodemailer from 'nodemailer';

export const sendEmail = async (mailOptions: Mail.Options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL!,
      pass: process.env.PASSWORD!,
    },
  });

  const info = await transporter.sendMail({
    from: `"Nest JS App" <${process.env.EMAIL!}>`,
    ...mailOptions,
  });

  console.log('Message sent:', info.messageId);

  return info.accepted.length > 0 ? true : false;
};

export const generateOtp = () => {
  return Math.floor(Math.random() * 900000 + 100000);
};
