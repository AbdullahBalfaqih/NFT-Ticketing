
'use server';

import nodemailer from 'nodemailer';

/**
 * دالة إرسال بريد ترحيبي للمستخدمين الجدد في بروتوكول EvenTix Chain
 */
export async function sendWelcomeEmail(toEmail: string, userName: string) {
  // إعداد وسيط الإرسال باستخدام Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '733537683a@gmail.com',
      pass: 'whgetvdqxqvlsndn',
    },
  });

  const logoUrl = 'https://res.cloudinary.com/ddznxtb6f/image/upload/v1774396174/image-removebg-preview_75_yghhlp.png';

  const htmlContent = `
    <div style="background-color: #000000; color: #ffffff; padding: 40px; font-family: 'Zain', Arial, sans-serif; text-align: right; border-radius: 20px; max-width: 600px; margin: 0 auto;" dir="rtl">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="${logoUrl}" alt="EvenTix Chain Logo" style="width: 180px;" />
      </div>
      
      <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 20px; font-weight: 900;">مرحباً بك في مستقبل الفعاليات!</h1>
      
      <p style="font-size: 18px; line-height: 1.6; color: #e5e7eb;">أهلاً بك يا <strong>${userName}</strong> في بروتوكول <strong>EvenTix Chain</strong>.</p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #9ca3af;">لقد قمنا بتأمين هويتك الرقمية بنجاح. تذاكرك الآن ليست مجرد أكواد دخول، بل هي أصول رقمية محمية بالكامل.</p>
      
      <div style="background-color: #0a0a0a; border: 1px solid #2563eb; padding: 25px; border-radius: 15px; margin: 30px 0;">
        <h3 style="color: #2563eb; font-size: 20px; margin-top: 0; margin-bottom: 15px;">كيف نحمي تجربتك؟</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 12px; display: flex; align-items: center;">
            <span style="color: #2563eb; margin-left: 10px;">✦</span>
            <span><strong>توثيق البلوكشين:</strong> يتم تسجيل ملكيتك على شبكة Polygon لضمان الأصالة المطلقة.</span>
          </li>
          <li style="margin-bottom: 12px; display: flex; align-items: center;">
            <span style="color: #2563eb; margin-left: 10px;">✦</span>
            <span><strong>نظام VTX-Guardian:</strong> حماية متطورة ضد البوتات وعمليات الاحتيال في السوق الثانوي.</span>
          </li>
          <li style="margin-bottom: 0; display: flex; align-items: center;">
            <span style="color: #2563eb; margin-left: 10px;">✦</span>
            <span><strong>الخزنة المدارة:</strong> أصولك مخزنة في محفظة مشفرة (EOA) خاصة بك وحدك.</span>
          </li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 40px;">
        <a href="https://eventix-chain.app" style="background-color: #2563eb; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 18px; display: inline-block; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);">استكشف الفعاليات الآن</a>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #1f2937; margin: 40px 0;" />
      
      <p style="font-size: 12px; color: #4b5563; text-align: center; margin-top: 20px;">
        هذا البريد مرسل تلقائياً من نظام EvenTix Chain. جميع الحقوق محفوظة © 2024.
      </p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"EvenTix Chain" <733537683a@gmail.com>',
      to: toEmail,
      subject: 'مرحباً بك في EvenTix Chain - تم تأمين خزنتك بنجاح 🛡️',
      html: htmlContent,
    });
    console.log('Welcome email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}
