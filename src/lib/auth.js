import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./schema";
import { Resend } from "resend";
import { emailOTP } from 'better-auth/plugins/email-otp';

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url, token }) => {
            const resetUrl = `${process.env.BETTER_AUTH_URL}/reset-password?token=${token}`;

            await resend.emails.send({
                from: process.env.FROM_EMAIL,
                to: user.email,
                subject: "Reset your password - AI Fiesta",
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password for AI Fiesta. Click the button below to reset it:</p>
            <a href="${resetUrl}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
              Reset Password
            </a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
            });
        },
    },
    emailVerification: {
        enabled: true,
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url, token }) => {
            await resend.emails.send({
                from: process.env.FROM_EMAIL,
                to: user.email,
                subject: "Verify your email - AI Fiesta",
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to AI Fiesta!</h2>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${url}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
              Verify Email
            </a>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
        `,
            });
        },
    },
    plugins: [
        emailOTP({
            sendVerificationOTP: async ({ email, otp, type }) => {
                let purposeLabel = '';
                if (type === 'sign-in') purposeLabel = 'Your sign-in code';
                else if (type === 'forget-password') purposeLabel = 'Password reset code';
                else purposeLabel = 'Email verification code';
                await resend.emails.send({
                    from: process.env.FROM_EMAIL,
                    to: email,
                    subject: `${purposeLabel} - AI Fiesta`,
                    html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>${purposeLabel}</h2>
                <p>Use the following code to continue:</p>
                <div style="font-size:32px; font-weight:700; letter-spacing:8px; background:#f5f5f5; padding:16px; text-align:center; border-radius:8px;">
                  ${otp}
                </div>
                <p style="margin-top:16px;">This code will expire in 5 minutes.</p>
                <p style="font-size:12px; color:#555;">If you did not request this, you can ignore this email.</p>
              </div>
            `,
                });
            },
        })
    ],
    trustedOrigins: ["localhost:3000", "aifiesta.manangandhi.tech"],
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 24 hours
    },
});


import { headers } from 'next/headers';
export async function getServerSession() {
    try {
        // better-auth exposes an API accessor
        const session = await auth.api.getSession({ headers: await headers() });
        return session;
    } catch (e) {
        return null;
    }
}