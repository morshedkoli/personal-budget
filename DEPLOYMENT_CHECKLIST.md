# Vercel Deployment Checklist for Email Functionality

## 🚨 Critical Steps to Fix OTP Email Issues

### 1. Set Environment Variables in Vercel Dashboard

**IMPORTANT**: Environment variables from your local `.env` file are NOT automatically available in Vercel.

#### Steps:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `personal-budget-ten-ecru`
3. Go to **Settings** → **Environment Variables**
4. Add ALL of these variables for **Production** environment:

```
NODE_ENV=production
EMAIL_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=kalikacchaudc@gmail.com
SMTP_PASSWORD=lbor yyhm comf gcef
EMAIL_USER=kalikacchaudc@gmail.com
EMAIL_PASSWORD=lbor yyhm comf gcef
EMAIL_FROM=kalikacchaudc@gmail.com
```

#### ⚠️ Security Note:
The Gmail password shown (`lbor yyhm comf gcef`) appears to be an App Password. Ensure:
- 2-Factor Authentication is enabled on Gmail
- This is an App-Specific Password (not your regular Gmail password)
- The password is still valid and not expired

### 2. Redeploy Your Application

After adding environment variables:
1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on the latest deployment
3. Wait for deployment to complete

### 3. Test Email Functionality

#### Option A: Use the Test Endpoint

1. After deployment, test the email endpoint:
   ```bash
   curl -X POST https://personal-budget-ten-ecru.vercel.app/api/test-email \
     -H "Content-Type: application/json" \
     -d '{"email":"your-test-email@gmail.com"}'
   ```

2. Check the response for success/error details

#### Option B: Test Through Registration

1. Go to: https://personal-budget-ten-ecru.vercel.app/auth/register
2. Try registering with a test email
3. Check if OTP email is received

### 4. Monitor Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → **Functions**
2. Look for any email-related errors in the logs
3. Check for timeout or configuration errors

### 5. Common Issues & Solutions

#### Issue: "Gmail configuration incomplete"
**Solution**: Ensure all Gmail environment variables are set in Vercel

#### Issue: "Authentication failed"
**Solutions**:
- Verify the App Password is correct
- Regenerate a new App Password in Gmail
- Ensure 2FA is enabled on Gmail account

#### Issue: "Connection timeout"
**Solutions**:
- The enhanced configuration should handle this
- Consider switching to SendGrid for better reliability

#### Issue: "Function timeout"
**Solution**: The `vercel.json` now includes 30-second timeout for API functions

### 6. Alternative Email Services (If Gmail Issues Persist)

If Gmail continues to have issues, consider these production-ready alternatives:

#### Option A: SendGrid (Recommended)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Get API key
3. Update Vercel environment variables:
   ```
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=your_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   ```

#### Option B: Resend (Modern Alternative)

1. Sign up at [Resend](https://resend.com/)
2. Get API key
3. Update email configuration to use Resend

### 7. Verification Steps

✅ **Environment variables set in Vercel**
✅ **Application redeployed**
✅ **Test email endpoint working**
✅ **Registration OTP emails received**
✅ **No errors in Vercel function logs**

### 8. Debug Information

#### Check Environment Variables
Visit: `https://personal-budget-ten-ecru.vercel.app/api/test-email` (GET request)

This will show which environment variables are configured.

#### Check Function Logs
1. Vercel Dashboard → Functions
2. Look for email-related function calls
3. Check for any error messages

### 9. Emergency Fallback

If emails still don't work, you can temporarily:
1. Use console logging for development
2. Implement a manual verification process
3. Switch to SMS OTP (using services like Twilio)

---

## 📞 Need Help?

If you're still experiencing issues:
1. Check Vercel function logs for specific error messages
2. Test the `/api/test-email` endpoint
3. Verify all environment variables are set correctly
4. Consider switching to SendGrid or another email service

**Most Common Fix**: Setting environment variables in Vercel Dashboard (Step 1)