import { FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions";

const TIME_ZONE = "America/Toronto";
const ALREADY_EXISTS = 6;

// Tomorrow's date as YYYY-MM-DD, the same format tasks store in dueDate
export function tomorrowString(now) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
  const [y, m, d] = today.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDueDate(value) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-CA", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function buildReminderEmail(task) {
  const course = task.course || "No course";
  const dueDate = formatDueDate(task.dueDate);
  return {
    subject: `Reminder: ${task.title} is due tomorrow`,
    text: `${task.title} is due tomorrow.\n\nCourse: ${course}\nDue date: ${dueDate}`,
    html: `<p><strong>${escapeHtml(task.title)}</strong> is due tomorrow.</p>
<p>Course: ${escapeHtml(course)}<br>Due date: ${dueDate}</p>`,
  };
}

// Emails the owner of every unfinished task due tomorrow. db and auth are the Admin SDK clients,
// sendEmail takes { to, subject, text, html } and throws if the send fails.
export async function sendDueReminders({ db, auth, sendEmail, now = new Date() }) {
  const dueDate = tomorrowString(now);
  const tasks = await db.collectionGroup("tasks").where("dueDate", "==", dueDate).get();
  let sent = 0;

  for (const taskDoc of tasks.docs) {
    const task = taskDoc.data();
    if (task.status === "Completed") continue;

    const uid = taskDoc.ref.parent.parent.id;

    // This runs hourly, so the claim doc is what stops a task being emailed twice.
    // It lives outside the task because firestore.rules rejects tasks with extra fields,
    // and the due date in the ID means moving a deadline earns a fresh reminder.
    const claim = db.collection("reminders").doc(`${uid}_${taskDoc.id}_${dueDate}`);
    try {
      await claim.create({ uid, taskId: taskDoc.id, dueDate, sentAt: FieldValue.serverTimestamp() });
    } catch (err) {
      if (err.code === ALREADY_EXISTS) continue;
      throw err;
    }

    try {
      // Auth, not users/{uid}, because users can edit their own profile doc
      const { email } = await auth.getUser(uid);
      await sendEmail({ to: email, ...buildReminderEmail(task) });
      sent += 1;
    } catch (err) {
      // Release the claim so the next run retries this task
      logger.error(`Reminder failed for task ${taskDoc.id}`, err);
      await claim.delete();
    }
  }

  logger.info(`Sent ${sent} reminder(s) for tasks due ${dueDate}`);
  return sent;
}
