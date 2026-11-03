// The fixed follow-up survey (FBS), asked some weeks after the first session.
// Wording comes from the study owner and must not be changed without their
// confirmation. Answers are stored raw by item id; this file deliberately has
// no field for a correct answer, and no scoring lives in this repository.
//
// Every item is required. One statement is shown per page.

export const FOLLOW_UP_SURVEY = {
  version: "followup-1",
  title: "Follow-up-Fragebogen: Nachhaltigkeit des erworbenen Wissens",
  sections: [
    {
      id: "fu",
      perItem: true,
      title: "Follow-up-Fragebogen (FBS): Nachhaltigkeit des erworbenen Wissens",
      intro: "Bitte geben Sie an, wie sehr Sie den folgenden Aussagen zustimmen.",
      items: [
        {"id": "fu.1", "type": "likert", "scale": "agreement", "text": "Ich kann mich auch heute noch gut an die im Video gezeigten anatomischen Strukturen des Felsenbeins erinnern."},
        {"id": "fu.2", "type": "likert", "scale": "agreement", "text": "Ich kann den operativen Ablauf der gezeigten OP auch jetzt noch in seinen wesentlichen Schritten wiedergeben."},
        {"id": "fu.3", "type": "likert", "scale": "agreement", "text": "Das im Video vermittelte Wissen hat mir seither im weiteren Studium/klinischen Alltag konkret weitergeholfen (z. B. bei Prüfungen, Famulatur, Unterricht)."},
        {"id": "fu.4", "type": "likert", "scale": "agreement", "text": "Ich habe mir das Video oder vergleichbare Inhalte seit der Intervention erneut angeschaut, um mein Wissen aufzufrischen."},
        {"id": "fu.5", "type": "likert", "scale": "agreement", "text": "Ich habe den Eindruck, dass mir die Inhalte aus diesem Video im Vergleich zu anderen Lehrformaten langfristig besser im Gedächtnis geblieben sind."},
      ],
    },
  ],
}
