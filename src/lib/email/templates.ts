export function getMissedDoseAlertEmailHtml({
  elderlyName,
  medicationName,
  dosage,
  scheduledTime,
  instructions,
  dashboardUrl,
  emergencyPhone,
}: {
  elderlyName: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  instructions: string;
  dashboardUrl: string;
  emergencyPhone?: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CareCircle Missed Medication Alert</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 24px; color: #19241E; }
    .container { max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #EAE2D8; padding: 32px; box-shadow: 0 4px 16px rgba(45, 90, 70, 0.06); }
    .header { border-bottom: 2px solid #F4EFEA; padding-bottom: 16px; margin-bottom: 24px; text-align: center; }
    .brand { font-size: 24px; font-weight: 800; color: #C85A32; letter-spacing: -0.5px; }
    .alert-badge { display: inline-block; background-color: #FBF3F0; color: #B24924; font-weight: 700; font-size: 14px; padding: 6px 14px; border-radius: 9999px; border: 1px solid #EDC7B9; margin-top: 12px; }
    .content { font-size: 16px; line-height: 1.6; color: #222D27; }
    .med-card { background-color: #FCFAF7; border: 1px solid #EAE2D8; border-left: 5px solid #C85A32; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .med-name { font-size: 20px; font-weight: 700; color: #19241E; }
    .med-detail { font-size: 15px; color: #602713; margin-top: 4px; }
    .btn { display: inline-block; background-color: #C85A32; color: #FFFFFF !important; font-weight: 700; font-size: 16px; text-decoration: none; padding: 14px 28px; border-radius: 10px; text-align: center; margin-top: 16px; }
    .btn-secondary { display: inline-block; background-color: #38684F; color: #FFFFFF !important; font-weight: 700; font-size: 16px; text-decoration: none; padding: 14px 24px; border-radius: 10px; text-align: center; margin-top: 16px; margin-left: 10px; }
    .footer { font-size: 13px; color: #752E15; text-align: center; margin-top: 32px; border-top: 1px solid #F4EFEA; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">CareCircle</div>
      <div class="alert-badge">Notice: Medication Status Update</div>
    </div>
    <div class="content">
      <p>Hello Caregiver,</p>
      <p>This is an automated notification from <strong>CareCircle</strong>. <strong>${elderlyName}</strong> has not logged their scheduled medication dose within the reminder window:</p>
      
      <div class="med-card">
        <div class="med-name">${medicationName} (${dosage})</div>
        <div class="med-detail"><strong>Scheduled Time:</strong> ${scheduledTime}</div>
        ${instructions ? `<div class="med-detail"><strong>Instructions:</strong> ${instructions}</div>` : ""}
      </div>

      <p>Please check in with ${elderlyName} to ensure they are feeling well and have assistance if needed.</p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${dashboardUrl}" class="btn">View Care Dashboard</a>
        ${emergencyPhone ? `<a href="tel:${emergencyPhone}" class="btn-secondary">Call ${elderlyName}</a>` : ""}
      </div>
    </div>
    <div class="footer">
      CareCircle Elderly Care &amp; Medication Management Platform.<br>
      This platform assists routine monitoring and does not provide clinical or diagnostic advice.
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getUpcomingDoseReminderEmailHtml({
  elderlyName,
  medicationName,
  dosage,
  scheduledTime,
  instructions,
  dashboardUrl,
}: {
  elderlyName: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  instructions: string;
  dashboardUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CareCircle Upcoming Dose Reminder</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 24px; color: #19241E; }
    .container { max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #EAE2D8; padding: 32px; box-shadow: 0 4px 16px rgba(45, 90, 70, 0.06); }
    .brand { font-size: 24px; font-weight: 800; color: #2D5A46; letter-spacing: -0.5px; text-align: center; }
    .pill-badge { display: inline-block; background-color: #F2F7F4; color: #2D5A46; font-weight: 700; font-size: 14px; padding: 6px 14px; border-radius: 9999px; border: 1px solid #C4D8CD; }
    .content { font-size: 16px; line-height: 1.6; color: #222D27; margin-top: 16px; }
    .med-card { background-color: #F2F7F4; border: 1px solid #C4D8CD; border-left: 5px solid #2D5A46; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .med-name { font-size: 22px; font-weight: 700; color: #19241E; }
    .btn { display: inline-block; background-color: #2D5A46; color: #FFFFFF !important; font-weight: 700; font-size: 17px; text-decoration: none; padding: 14px 28px; border-radius: 10px; text-align: center; margin-top: 16px; }
    .footer { font-size: 13px; color: #555; text-align: center; margin-top: 32px; border-top: 1px solid #F4EFEA; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">CareCircle</div>
    <div style="text-align: center; margin-top: 8px;">
      <span class="pill-badge">Medication Reminder</span>
    </div>
    <div class="content">
      <p>Hello <strong>${elderlyName}</strong>,</p>
      <p>It will soon be time for your scheduled medication:</p>
      
      <div class="med-card">
        <div class="med-name">${medicationName} (${dosage})</div>
        <div style="margin-top: 6px; font-size: 16px;"><strong>Scheduled Time:</strong> ${scheduledTime}</div>
        ${instructions ? `<div style="margin-top: 6px; font-size: 15px;"><strong>Instructions:</strong> ${instructions}</div>` : ""}
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${dashboardUrl}" class="btn">Confirm You Took It</a>
      </div>
    </div>
    <div class="footer">
      CareCircle Elderly Care &amp; Medication Management Platform.
    </div>
  </div>
</body>
</html>
  `.trim();
}
