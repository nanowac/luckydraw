const USERNAME_TITLE = 'ชื่อบัญชีสมาชิก (Username)';

function doGet() {
  const form = FormApp.openById(PropertiesService.getScriptProperties().getProperty('SURVEY_FORM_ID'));
  const fields = form.getItems(FormApp.ItemType.TEXT)
    .filter(item => item.getTitle() === USERNAME_TITLE);
  if (fields.length !== 1) throw new Error('Expected one Username field.');

  const usernameId = fields[0].getId();
  const usernames = new Set();
  const accounts = [];
  let updatedAt = null;

  for (const response of form.getResponses()) {
    const answer = response.getItemResponses()
      .find(item => item.getItem().getId() === usernameId);
    const username = String(answer ? answer.getResponse() : '').trim();
    if (!username) continue;
    const acceptedAt = response.getTimestamp().toISOString();
    if (!updatedAt || acceptedAt > updatedAt) updatedAt = acceptedAt;

    const key = username.toLowerCase();
    if (usernames.has(key)) continue;
    usernames.add(key);

    const chars = Array.from(username);
    const masked = chars.length > 4
      ? chars.slice(0, 2).join('') + 'XXX' + chars.slice(-2).join('')
      : 'XXX';
    accounts.push({ masked, tickets: 1 });
  }
  const payload = JSON.stringify({ updatedAt, accounts });
  return ContentService.createTextOutput('receiveSurveyPool(' + payload + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
