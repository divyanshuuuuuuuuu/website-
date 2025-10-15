const sgMail = require('@sendgrid/mail');

class OTPService {
    constructor(apiKey, fromEmail) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.otpStore = new Map(); // In production, use Redis or database

        // Configure SendGrid
        sgMail.setApiKey(this.apiKey);
    }

    // Generate 6-digit OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP via email
    async sendOTP(email) {
        try {
            const otp = this.generateOTP();
            const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

            // Store OTP with expiry
            this.otpStore.set(email, { otp, expiresAt });

            // Send email with enhanced design
            const msg = {
                to: email,
                from: {
                    email: this.fromEmail,
                    name: 'Rasoiyaa Food'
                },
                replyTo: this.fromEmail,
                subject: 'Rasoiyaa Food - Your Account Access Code',
                headers: {
                    'X-Mailer': 'Rasoiyaa-Food-System',
                    'X-Priority': '1',
                    'X-MSMail-Priority': 'High',
                    'List-Unsubscribe': '<mailto:unsubscribe@rasoiyaafood.com>'
                },
                text: `Hello from Rasoiyaa Food!

Your account access code is: ${otp}

This code will expire in 5 minutes for security reasons.

If you did not request this code, please ignore this email.

Best regards,
Rasoiyaa Food Team
Satna, Madhya Pradesh, India
Contact: gita82tripathi@gmail.com`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Your Login Code</title>
                    </head>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
                            <h1 style="color: #e74c3c; margin-bottom: 20px;">Rasoiyaa Food</h1>
                            <h2 style="color: #333; margin-bottom: 30px;">Your Account Access Code</h2>
                            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">Hello! You requested an access code for your Rasoiyaa Food account.</p>

                            <div style="background: #fff; padding: 20px; border-radius: 8px; border: 2px solid #e74c3c; margin: 20px 0;">
                                <p style="margin: 0; font-size: 18px; color: #666;">Your login code is:</p>
                                <div style="font-size: 32px; font-weight: bold; color: #e74c3c; letter-spacing: 5px; margin: 15px 0;">${otp}</div>
                            </div>

                            <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes for security reasons.</p>
                            <p style="color: #999; font-size: 12px; margin-top: 30px;">If you did not request this code, please ignore this email.</p>

                            <div style="background: #fff; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: left;">
                                <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">About Rasoiyaa Food</h3>
                                <p style="color: #666; font-size: 14px; margin: 0;">We are a traditional Indian snacks company based in Satna, Madhya Pradesh. We specialize in authentic, homemade snacks delivered fresh to your doorstep.</p>
                            </div>

                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                                <p style="color: #999; font-size: 12px; margin: 0;">
                                    Rasoiyaa Food - Authentic Indian Snacks<br>
                                    Satna, Madhya Pradesh, India<br>
                                    Contact: +91 8085654059 | rasoiyaafood@gmail.com
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            await sgMail.send(msg);
            console.log(`OTP sent successfully to: ${email}`);
            return { success: true, message: 'OTP sent successfully' };

        } catch (error) {
            console.error('Failed to send OTP:', error);
            return { success: false, message: 'Failed to send OTP' };
        }
    }

    // Verify OTP
    verifyOTP(email, inputOTP) {
        try {
            const stored = this.otpStore.get(email);

            if (!stored) {
                return { success: false, message: 'No OTP found for this email' };
            }

            if (Date.now() > stored.expiresAt) {
                this.otpStore.delete(email);
                return { success: false, message: 'OTP has expired' };
            }

            if (stored.otp !== inputOTP) {
                return { success: false, message: 'Invalid OTP' };
            }

            // OTP is valid, remove it
            this.otpStore.delete(email);
            return { success: true, message: 'OTP verified successfully' };

        } catch (error) {
            console.error('Failed to verify OTP:', error);
            return { success: false, message: 'Failed to verify OTP' };
        }
    }

    // Check if OTP exists for email
    hasOTP(email) {
        const stored = this.otpStore.get(email);
        if (!stored) return false;
        if (Date.now() > stored.expiresAt) {
            this.otpStore.delete(email);
            return false;
        }
        return true;
    }

    // Clear expired OTPs (call this periodically)
    clearExpiredOTPs() {
        const now = Date.now();
        for (const [email, data] of this.otpStore.entries()) {
            if (now > data.expiresAt) {
                this.otpStore.delete(email);
            }
        }
    }
}

module.exports = OTPService;