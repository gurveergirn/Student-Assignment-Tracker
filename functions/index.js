import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { Resend } from "resend";
import { sendDueReminders } from "./reminders.js";

// resend.dev can only deliver to the Resend account's own email.
// Swap this for an address on a verified domain to email other users.
const FROM_ADDRESS = "Student Task Tracker <onboarding@resend.dev>";

const resendApiKey = defineSecret("RESEND_API_KEY");

initializeApp();

// Due dates have no time, so "24 hours before" means the day before. Running hourly instead of
// once a day means tasks created during that day still get a reminder.
export const sendTaskReminders = onSchedule(
  { schedule: "0 8-22 * * *", timeZone: "America/Toronto", secrets: [resendApiKey] },
  async () => {
    const resend = new Resend(resendApiKey.value());

    await sendDueReminders({
      db: getFirestore(),
      auth: getAuth(),
      sendEmail: async (email) => {
        // Resend returns failures instead of throwing them
        const { error } = await resend.emails.send({ from: FROM_ADDRESS, ...email });
        if (error) throw new Error(`${error.name}: ${error.message}`);
      },
    });
  }
);
