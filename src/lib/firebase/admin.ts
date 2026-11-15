import * as admin from "firebase-admin";

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PRIVATE_KEY ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.K_SERVICE // Cloud Run indicator
  );
}

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID;

  if (privateKey) {
    // Correct newline formatting if stored in single-line env var
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    });
  }

  // Fallback to Google Cloud Application Default Credentials (standard on Cloud Run)
  try {
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId,
    });
  } catch (error) {
    // Local development fallback
    return admin.initializeApp({
      projectId: projectId || "carecircle-dev",
    });
  }
}

export const adminApp = getAdminApp();
export const adminAuth = adminApp ? admin.auth(adminApp) : null!;
export const adminDb = adminApp ? admin.firestore(adminApp) : null!;
