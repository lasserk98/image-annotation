// PLACEHOLDER follow-up survey for phase 3. The wording will be supplied by the
// study owner and must replace this before phase 3 is sent out, together with
// the placeholder test in followUpSurvey.test.js. Like the other surveys it is
// plain data: answers are stored raw by item id, with no answer key and no
// scoring in this repository.

export const FOLLOW_UP_SURVEY = {
  version: "followup-placeholder",
  title: "Nachbefragung",
  sections: [
    {
      id: "followup",
      title: "Nachbefragung",
      intro: "[PLATZHALTER – Der Fragebogen der Nachbefragung folgt.]",
      items: [
        {"id": "followup.note", "type": "text", "optional": true, "text": "Anmerkungen (optional):"},
      ],
    },
  ],
}
