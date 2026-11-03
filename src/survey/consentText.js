// Consent text, stated in German whatever the interface language. Wording
// comes from the study owner and the data protection officers and must not be
// changed without their confirmation. Bump `version` with every change of the
// wording: it is stored with each participant's consent.
//
// A section is `{ heading, paragraphs, subsections? }`; a subsection is
// `{ heading, paragraphs }`.
export const CONSENT_TEXT = {
  version: 'consent-1',
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
          heading: 'Verantwortliche Stelle',
          paragraphs: [
            'Die Studie erfolgt in Kooperation zwischen dem Fraunhofer-Institut für Nachrichtentechnik, Heinrich-Hertz-Institut (Fraunhofer HHI), der Universitätsmedizin Rostock und der Charité – Universitätsmedizin Berlin.',
          ],
        },
        {
          heading: 'Zweck und Rechtsgrundlage',
          paragraphs: [
            'Die Daten werden zur wissenschaftlichen Auswertung der Lehrvideos und zur Beantwortung der Forschungsfragen dieser Studie verarbeitet.',
            'Die Verarbeitung der im Rahmen der Studie erhobenen personenbezogenen Daten erfolgt auf Grundlage der Einwilligung der teilnehmenden Personen gemäß Art. 6 Abs. 1 lit. a DSGVO. Die Verarbeitung zu wissenschaftlichen Forschungszwecken erfolgt unter Beachtung der Schutzmaßnahmen gemäß Art. 89 DSGVO sowie der einschlägigen datenschutzrechtlichen Bestimmungen.',
          ],
        },
        {
          heading: 'Codierung und Anonymisierung',
          paragraphs: [
            'Die Fragebögen werden zunächst mit einem Code versehen, sodass eine Zuordnung zu einzelnen Teilnehmenden vorübergehend möglich sein kann. Solange eine solche Zuordnung möglich ist, handelt es sich um pseudonymisierte und weiterhin datenschutzrechtlich geschützte Daten, nicht um vollständig anonyme Daten. Die Zuordnungsliste wird getrennt von den Fragebogendaten und zugriffsgeschützt aufbewahrt. Sobald es der Studienzweck zulässt, sollen die für die wissenschaftliche Auswertung verwendeten Daten anonymisiert werden.',
          ],
        },
        {
          heading: 'Zugriff und Weitergabe',
          paragraphs: [
            'Zugriff auf nicht anonymisierte bzw. pseudonymisierte Daten erhalten ausschließlich hierzu berechtigte Personen des Studienteams.',
          ],
        },
        {
          heading: 'Speicherdauer',
          paragraphs: [
            'Die im Rahmen der Studie erhobenen Forschungsdaten werden zunächst pseudonymisiert verarbeitet. Die Zuordnungsliste wird getrennt von den Forschungsdaten und zugriffsgeschützt aufbewahrt. Nach Abschluss der Auswertung werden die Forschungsdaten, soweit möglich, anonymisiert.',
            'Die anonymisierten Forschungsdaten werden zur Sicherung der wissenschaftlichen Nachvollziehbarkeit und gemäß den Grundsätzen guter wissenschaftlicher Praxis grundsätzlich für zehn Jahre archiviert. Personenbezogene Daten und die Zuordnungsliste werden gelöscht, sobald deren weitere Speicherung für die Durchführung, Dokumentation oder zulässige Archivierung der Studie nicht mehr erforderlich ist und keine gesetzlichen oder institutionellen Aufbewahrungspflichten entgegenstehen.',
          ],
        },
        {
          heading: 'Ihre Datenschutzrechte',
          paragraphs: [
            'Im Rahmen der geltenden Datenschutzbestimmungen können – abhängig von Rechtsgrundlage und Verarbeitungsstadium – Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Widerspruch und gegebenenfalls Datenübertragbarkeit bestehen. Sofern die Verarbeitung auf einer Einwilligung beruht, kann diese grundsätzlich mit Wirkung für die Zukunft widerrufen werden. Nach wirksamer Anonymisierung können Daten in der Regel nicht mehr einer einzelnen Person zugeordnet und deshalb auch nicht individuell herausgesucht oder gelöscht werden. Sie können sich außerdem bei einer zuständigen Datenschutzaufsichtsbehörde beschweren.',
          ],
        },
        {
          heading: 'Kontakt für Datenschutzfragen',
          paragraphs: [
            'Datenschutzkontakt der Universitätsmedizin Rostock: Der Datenschutzbeauftragte der Universitätsmedizin Rostock ist erreichbar unter Doberaner Str. 142, 18057 Rostock, Tel. 0381 494 5155 / 5173, E-Mail: datenschutz@med.uni-rostock.de.',
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
