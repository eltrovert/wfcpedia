# Setup Validation Scripts

```typescript
// scripts/validate-setup.js - Ensures all external services ready

const validateSetup = async () => {
  console.log('🔍 Validating WFC-Pedia Setup...')

  const validations = [
    {
      name: 'Google Sheets API',
      test: () => testGoogleSheetsConnection(),
      required: true,
    },
    {
      name: 'Cloudinary Image Service',
      test: () => testCloudinaryConnection(),
      required: true,
    },
    {
      name: 'Environment Variables',
      test: () => validateEnvironmentVariables(),
      required: true,
    },
    {
      name: 'Service Account Permissions',
      test: () => testServiceAccountPermissions(),
      required: true,
    },
  ]

  let allPassed = true

  for (const validation of validations) {
    try {
      console.log(`Testing ${validation.name}...`)
      await validation.test()
      console.log(`✅ ${validation.name} - PASSED`)
    } catch (error) {
      console.error(`❌ ${validation.name} - FAILED:`, error.message)
      if (validation.required) {
        allPassed = false
      }
    }
  }

  if (allPassed) {
    console.log('\n🎉 All validations passed! Ready for development.')
    process.exit(0)
  } else {
    console.error('\n😨 Setup validation failed. Please fix issues before development.')
    console.error('Refer to Story 1.0 documentation for setup instructions.')
    process.exit(1)
  }
}

const testGoogleSheetsConnection = async () => {
  const { GoogleAuth } = require('google-auth-library')
  const auth = new GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const authClient = await auth.getClient()
  const sheets = require('googleapis').sheets({ version: 'v4', auth: authClient })

  // Test read operation
  await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.VITE_SHEETS_ID,
    range: 'Cafes!A1:A1',
  })
}

const testCloudinaryConnection = async () => {
  const cloudinary = require('cloudinary').v2
  cloudinary.config({
    cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.VITE_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  // Test API connectivity
  await cloudinary.api.ping()
}

const validateEnvironmentVariables = () => {
  const required = [
    'VITE_GOOGLE_API_KEY',
    'VITE_SHEETS_ID',
    'VITE_CLOUDINARY_CLOUD_NAME',
    'VITE_CLOUDINARY_API_KEY',
    'GOOGLE_SERVICE_ACCOUNT_PATH',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

validateSetup()
```

---
