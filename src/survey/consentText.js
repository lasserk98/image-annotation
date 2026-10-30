// Consent text, stated in German whatever the interface language.
// TODO: `dataProtection` is still a PLACEHOLDER. The Datenschutz wording and
// the data-processing agreement must be supplied by the study owner / data
// protection officer and replace it before the pilot.
export const CONSENT_TEXT = {
  title: 'Studie zur KI-gestützten Annotation von Lehrvideos in der Cochleaimplantation',
  paragraphs: [
    'Im Rahmen dieser wissenschaftlichen Studie wird der Einsatz unterschiedlicher Lehrvideos zur Vermittlung anatomischer Strukturen und operativer Abläufe bei der Cochleaimplantation untersucht. Ziel ist es, den Nutzen KI-gestützter Annotationen für die medizinische Lehre zu evaluieren. Die Studie dient ausschließlich wissenschaftlichen Zwecken und ist nicht kommerziell ausgerichtet.',
    'Die Teilnahme an der Studie ist freiwillig. Die erhobenen Daten werden vertraulich behandelt und im Rahmen der geltenden datenschutzrechtlichen Bestimmungen verarbeitet. Die Auswertung erfolgt anonymisiert, sodass die Studienergebnisse keinen Rückschluss auf einzelne Teilnehmende ermöglichen sollen. Die Teilnahme sowie die individuellen Ergebnisse haben keinen Einfluss auf Prüfungsleistungen, Noten oder sonstige akademische Bewertungen.',
    'Die im Rahmen der Studie bereitgestellten Bilder und Videos sowie die zugehörigen Lehrmaterialien sind ausschließlich für die vorgesehenen Studienzwecke bestimmt. Eine eigenständige Weitergabe, Veröffentlichung oder anderweitige Verbreitung dieser Materialien durch die Teilnehmenden ist nicht gestattet.',
    'Nach Abschluss der Studie erhalten alle Teilnehmenden Zugang zu sämtlichen im Rahmen der Studie verwendeten Lehrmaterialien, unabhängig von ihrer jeweiligen Studiengruppe. Dadurch wird sichergestellt, dass allen Teilnehmenden die gleichen Lernmaterialien zur Verfügung stehen.',
    'Die Teilnehmenden können Fragen zur Studie jederzeit an die Studienverantwortlichen richten. Sie haben das Recht, ihre Teilnahme ohne Angabe von Gründen zu beenden. Ein Abbruch hat keine Nachteile für das Studium oder die akademische Bewertung. Welche Auswirkungen ein Widerruf auf bereits erhobene Daten hat, richtet sich nach dem jeweils geltenden Datenschutzkonzept der Studie.',
  ],
  dataProtection: {
    heading: 'Datenschutz und Verarbeitung personenbezogener Daten',
    paragraphs: [
      '[PLATZHALTER – Die Datenschutzhinweise (verantwortliche Stelle, Art der Daten, Zweck und Rechtsgrundlage, Speicherdauer, Betroffenenrechte, Widerruf) folgen nach Prüfung durch die Datenschutzbeauftragten.]',
    ],
  },
  declaration: {
    heading: 'Einverständniserklärung',
    intro:
      'Ich habe die Informationen zur Studie gelesen und verstanden. Ich hatte Gelegenheit, offene Fragen zu stellen, und konnte diese klären. Ich wurde über den wissenschaftlichen Zweck der Studie, den vertraulichen Umgang mit meinen Daten, die Freiwilligkeit der Teilnahme sowie meine Rechte als teilnehmende Person informiert.',
  },
  // Every agreement has to be ticked before the participant can continue.
  agreements: [
    { id: 'participation', label: 'Ich erkläre mich bereit, freiwillig an der Studie teilzunehmen.' },
    {
      id: 'dataProtection',
      label: 'Ich willige in die Verarbeitung meiner personenbezogenen Daten wie im Abschnitt „Datenschutz und Verarbeitung personenbezogener Daten“ beschrieben ein.',
    },
  ],
}
