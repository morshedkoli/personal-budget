# Vercel Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables Setup
Ensure all required environment variables are configured in your Vercel dashboard:

#### Required Variables:
```
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
NODE_ENV=production
```

#### Email Configuration (Choose one):

**Option 1: Gmail**
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Option 2: SendGrid**
```
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=your-verified-sender@domain.com
```

**Option 3: Custom SMTP**
```
EMAIL_SERVICE=other
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
EMAIL_FROM=your-email@domain.com
```

### 2. Database Setup
1. Ensure your MongoDB database is accessible from Vercel
2. Whitelist Vercel's IP ranges in your MongoDB Atlas network access
3. Test the connection string locally before deploying

### 3. Build Configuration
The project is configured with:
- `postinstall` script for Prisma generation
- Optimized Next.js configuration for serverless
- Proper middleware for authentication
- Error boundaries for hydration issues

## Deployment Steps

### 1. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Select the root directory

### 2. Configure Build Settings
Vercel should automatically detect:
- Framework: Next.js
- Build Command: `npm run vercel-build`
- Output Directory: `.next`
- Install Command: `npm install`

### 3. Environment Variables
1. Go to Project Settings → Environment Variables
2. Add all required variables from the checklist above
3. Ensure they're available for Production, Preview, and Development

### 4. Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Check the deployment logs for any errors

## Post-Deployment Verification

### 1. Test Core Functionality
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] Email sending works (check test-email endpoint)
- [ ] User login works
- [ ] Dashboard loads with authentication
- [ ] Database operations work (create/read transactions)

### 2. Check Function Logs
1. Go to Project → Functions tab
2. Monitor logs for any runtime errors
3. Pay special attention to:
   - Email sending functions
   - Database connection issues
   - Authentication errors

### 3. Performance Monitoring
- Check function execution times
- Monitor memory usage
- Verify cold start performance

## Common Issues and Solutions

### 1. Prisma Issues
**Problem**: Prisma client not generated
**Solution**: 
- Ensure `postinstall` script runs
- Check build logs for Prisma generation
- Verify `DATABASE_URL` is set correctly

### 2. Email Issues
**Problem**: Emails not sending
**Solutions**:
- Verify email environment variables
- Check Gmail App Password setup
- Test with `/api/test-email` endpoint
- Monitor function logs for email errors

### 3. Authentication Issues
**Problem**: JWT/Auth not working
**Solutions**:
- Verify `JWT_SECRET` and `NEXTAUTH_SECRET` are set
- Check `NEXTAUTH_URL` matches your domain
- Ensure middleware is working correctly

### 4. Database Connection Issues
**Problem**: Cannot connect to MongoDB
**Solutions**:
- Verify `DATABASE_URL` format
- Check MongoDB Atlas network access
- Ensure database user has proper permissions
- Test connection string locally

### 5. Hydration Issues
**Problem**: React hydration mismatches
**Solutions**:
- Check browser console for hydration errors
- Verify localStorage usage is properly guarded
- Ensure server and client render the same content

## Environment-Specific Notes

### Development
- Uses Ethereal Email for testing
- Local MongoDB or MongoDB Atlas
- Hot reloading enabled

### Production (Vercel)
- Real email service required
- MongoDB Atlas recommended
- Optimized for serverless functions
- Enhanced security headers

## Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **CORS**: Configured for your domain only
3. **Headers**: Security headers added via vercel.json
4. **Authentication**: JWT tokens with proper expiration
5. **Database**: Use connection pooling and proper indexes

## Performance Optimizations

1. **Function Memory**: Set to 1024MB for better performance
2. **Caching**: API responses cached appropriately
3. **Bundle Size**: Optimized with Next.js standalone output
4. **Database**: Connection pooling enabled
5. **Images**: Optimized with Next.js Image component

## Monitoring and Maintenance

1. **Logs**: Regularly check Vercel function logs
2. **Performance**: Monitor function execution times
3. **Errors**: Set up error tracking (Sentry recommended)
4. **Database**: Monitor MongoDB Atlas metrics
5. **Email**: Track email delivery rates

## Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test locally with production environment variables
4. Check this guide for common solutions
5. Review Vercel documentation for platform-specific issues