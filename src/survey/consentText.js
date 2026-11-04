// Consent text, stated in German whatever the interface language. Wording
// comes from the study owner and the data protection officers and must not be
// changed without their confirmation. Bump `version` with every change of the
// wording: it is stored with each participant's consent.
//
// A section is `{ heading, paragraphs, subsections? }`; a subsection is
// `{ heading, paragraphs }`.
export const CONSENT_TEXT = {
  version: 'consent-2',
  title: 'Studie zur KI-gestützten Annotation von Lehrvideos in der Cochleaimplantation',
  subtitle: 'Information für Studienteilnehmende, Datenschutzhinweise und Einverständniserklärung',
  sections: [
    {
      heading: 'Information zur Studie',
      paragraphs: [
        'Im Rahmen dieser wissenschaftlichen Studie wird der Einsatz unterschiedlicher Lehrvideos zur Vermittlung anatomischer Strukturen und operativer Abläufe bei der Cochleaimplantation untersucht. Ziel ist es, den Nutzen KI-gestützter Annotationen für die medizinische Lehre zu evaluieren. Die Studie dient ausschließlich wissenschaftlichen Zwecken und ist nicht kommerziell ausgerichtet.',
      ],
    },
    {
      heading: 'Freiwilligkeit und Rechte',
      paragraphs: [
        'Die Teilnahme ist freiwillig. Eine Nichtteilnahme oder ein Abbruch hat keine Nachteile für das Studium oder die akademische Bewertung. Die Teilnahme und die individuellen Ergebnisse haben keinen Einfluss auf Prüfungsleistungen oder Noten. Fragen zur Studie können jederzeit an die Studienverantwortlichen gerichtet werden. Die Auswirkungen eines Abbruchs auf bereits erhobene Daten richten sich nach dem jeweiligen Datenschutzkonzept.',
      ],
    },
    {
      heading: 'Vertraulichkeit der Lehrmaterialien',
      paragraphs: [
        'Die im Rahmen der Studie bereitgestellten Bilder, Videos und Lehrmaterialien sind ausschließlich für die vorgesehenen Studienzwecke bestimmt. Eine eigenständige Weitergabe, Veröffentlichung oder anderweitige Verbreitung dieser Materialien durch Teilnehmende ist nicht gestattet. Nach Abschluss der Studie erhalten alle Teilnehmenden unabhängig von ihrer Studiengruppe Zugang zu sämtlichen im Rahmen der Studie verwendeten Lehrmaterialien.',
      ],
    },
    {
      heading: 'Datenschutzhinweise',
      paragraphs: [
        'Im Rahmen der Studie werden Angaben zur Bewertung der Lehrvideos erhoben. Dazu können Antworten auf Fragebögen sowie Angaben zum Geschlecht, Alter und zum Studiensemester gehören.',
      ],
      subsections: [
        {
          heading: 'Verantwortliche Einrichtung und Kooperation',
          paragraphs: [
            'Verantwortliche Einrichtung: Universitätsmedizin Rostock – rechtsfähige Teilkörperschaft der Universität Rostock, Schillingallee 35, 18057 Rostock, Tel. 0381 494 0, www.med.uni-rostock.de, presse@med.uni-rostock.de. Die Studie erfolgt in Kooperation mit dem Fraunhofer-Institut für Nachrichtentechnik, Heinrich-Hertz-Institut (Fraunhofer HHI).',
          ],
        },
        {
          heading: 'Zweck der Datenverarbeitung',
          paragraphs: [
            'Die erhobenen Daten werden ausschließlich für die wissenschaftliche Auswertung der Lehrvideos und zur Beantwortung der Forschungsfragen dieser Studie verwendet.',
          ],
        },
        {
          heading: 'Pseudonymisierung, Speicherung und Anonymisierung',
          paragraphs: [
            'Die erhobenen Fragebogendaten werden pseudonymisiert, indem personenbezogene Angaben durch einen Code ersetzt werden. Die Zuordnung der Codes zu den teilnehmenden Personen wird in einer separaten, gesicherten Entschlüsselungsdatei aufbewahrt. Die pseudonymisierten Daten werden auf gesicherten Servern gespeichert; elektronische Übertragungen erfolgen verschlüsselt. Nach Abschluss der wissenschaftlichen Auswertung wird die Entschlüsselungsdatei gelöscht, sodass die verbleibenden Studiendaten anonymisiert sind.',
          ],
        },
        {
          heading: 'Zugriff, Weitergabe und Veröffentlichung',
          paragraphs: [
            'Zugriff auf personenbezogene Daten haben ausschließlich berechtigte, unmittelbar an Durchführung und Auswertung beteiligte Personen des Studienteams. Personenbezogene Daten werden nicht an Dritte außerhalb des Studienzentrums weitergegeben. Pseudonymisierte Daten können, soweit für die wissenschaftliche Auswertung erforderlich, an Kooperationspartner oder wissenschaftliche Einrichtungen übermittelt werden. Wissenschaftliche Veröffentlichungen erfolgen ausschließlich in anonymisierter oder zusammengefasster Form.',
          ],
        },
        {
          heading: 'Aufbewahrungsdauer',
          paragraphs: [
            'Die anonymisierten Forschungsdaten werden nach Ende der Studie gelöscht. Die Entschlüsselungsdatei wird nach Abschluss der wissenschaftlichen Auswertung gelöscht. Für Einwilligungsunterlagen gelten die jeweils einschlägigen Aufbewahrungsvorgaben.',
          ],
        },
        {
          heading: 'Ihre Rechte',
          paragraphs: [
            'Gemäß den geltenden Datenschutzbestimmungen bestehen grundsätzlich Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Widerspruch und Datenübertragbarkeit. Eine erteilte Einwilligung kann widerrufen werden. Die verantwortliche Einrichtung prüft im Einzelfall, inwieweit dem jeweiligen Anliegen entsprochen werden kann. Nach vollständiger Anonymisierung ist eine individuelle Zuordnung und Löschung der Daten nicht mehr möglich. Außerdem besteht ein Beschwerderecht bei der zuständigen Datenschutzaufsichtsbehörde.',
          ],
        },
        {
          heading: 'Kontakte und Datenschutzaufsicht',
          paragraphs: [
            'Datenschutzbeauftragter der Universitätsmedizin Rostock: Doberaner Str. 142, 18057 Rostock, Tel. 0381 494 5155 / 5173, E-Mail: datenschutz@med.uni-rostock.de.',
            'Zuständige Aufsichtsbehörde: Der Landesbeauftragte für Datenschutz und Informationsfreiheit Mecklenburg-Vorpommern, Schloss Schwerin, Lennéstr. 1, 19053 Schwerin, Tel. 0385 59494 0, E-Mail: info@datenschutz-mv.de.',
            'Kontakt für Fragen zur Studie: Solenne Sandkötter/Doktorandin, E-Mail-Kontakt: solenne.sandkoetter@uni-rostock.de.',
          ],
        },
      ],
    },
  ],
  declaration: {
    heading: 'Einverständniserklärung',
    intro:
      'Ich habe die Informationen zur Studie und die Datenschutzhinweise gelesen und verstanden. Ich hatte Gelegenheit, Fragen zu stellen und offene Fragen zu klären. Ich weiß, dass meine Teilnahme freiwillig ist und dass meine Teilnahme bzw. meine Ergebnisse keinen Einfluss auf meine Noten oder Prüfungsleistungen haben.',
  },
  // Every agreement has to be ticked before the participant can continue.
  // The second label is worded by us, not taken from the study owner's text.
  agreements: [
    { id: 'participation', label: 'Ich erkläre mich bereit, freiwillig an der Studie teilzunehmen.' },
    {
      id: 'dataProtection',
      label: 'Ich willige in die Verarbeitung meiner personenbezogenen Daten wie in den Datenschutzhinweisen beschrieben ein.',
    },
  ],
}
