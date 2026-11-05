# How to run

Install node:
https://nodejs.org/en/download

run 'npm install' in cmd while in project directory
run 'npm run dev' to run project locally

# Reminder emails setup

The `sendTaskReminders` Cloud Function emails users about unfinished tasks due tomorrow. It runs every hour from 8:00 to 22:00 Toronto time.

1. In the Firebase console, upgrade the project to the Blaze plan (Cloud Functions requires it)
2. Create a Resend account at https://resend.com and create an API key
3. Run these from the project directory:

```
npm install -g firebase-tools
firebase login
firebase use --add
cd functions
npm install
cd ..
firebase functions:secrets:set RESEND_API_KEY
firebase deploy --only functions,firestore:indexes
```

Emails are sent from `onboarding@resend.dev`, which can only deliver to the email on your Resend account. To email other users, verify a domain in Resend and change `FROM_ADDRESS` in `functions/index.js`.

Check the logs with `firebase functions:log --only sendTaskReminders`.
