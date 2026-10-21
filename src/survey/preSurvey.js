// The fixed pre-study survey, as data. Wording comes from the study owner and
// must not be changed without their confirmation. Answers are stored raw by
// item id; this file deliberately has no field for a correct answer, and no
// scoring lives in this repository — that happens later, outside it.
//
// Item types: number {min,max}, choice {options}, likert {scale}, text.
// Every item is required unless it says `optional: true`.

// Likert scales: values run min..max; `labels` are the captions shown for
// those values (a scale may label only its ends).
export const SCALES = {
  agreement: {"min": 1, "max": 5, "labels": {"1": "stimmt voll zu", "2": "stimmt eher zu", "3": "teils/teils", "4": "stimmt eher nicht zu", "5": "stimmt nicht zu"}},
  frequency: {"min": 1, "max": 5, "labels": {"1": "sehr oft", "5": "nie"}},
  competence: {"min": 1, "max": 5, "labels": {"1": "sehr gut", "5": "sehr schlecht"}},
}

export const PRE_SURVEY = {
  version: "pre-1",
  title: "Potenziale KI-augmentierter OP-Lehrvideos in der Felsenbeinchirurgie",
  sections: [
    {
      id: "demo",
      title: "Demographie und Nutzungsdaten",
      items: [
        {"id": "demo.age", "type": "number", "label": "Alter", "min": 16, "max": 99},
        {"id": "demo.gender", "type": "choice", "label": "Geschlecht", "options": [{"value": "weiblich", "label": "weiblich"}, {"value": "männlich", "label": "männlich"}, {"value": "divers", "label": "divers"}, {"value": "keine Angabe", "label": "keine Angabe"}]},
        {"id": "demo.semester", "type": "number", "label": "Semester", "min": 1, "max": 20},
        {"id": "demo.lectures", "type": "likert", "scale": "frequency", "text": "Wie regelmäßig besuchen sie generell Vorlesungen?"},
        {"id": "demo.aiCompetence", "type": "likert", "scale": "competence", "text": "Wie schätzen Sie ihre eigene KI-Kompetenz ein?"},
        {"id": "demo.aiFrequency", "type": "likert", "scale": "frequency", "text": "Wie regelmäßig nutzen sie KI-Tools?"},
        {"id": "demo.aiTools", "type": "text", "optional": true, "text": "Welche KI-Tools nutzen Sie:"},
      ],
    },
    {
      id: "pre",
      perItem: true,
      title: "Prä-interventioneller Fragebogen",
      intro: "Bitte geben Sie an, wie sehr Sie den folgenden Aussagen zustimmen.",
      items: [
        {"id": "pre.1", "type": "likert", "scale": "agreement", "topic": "Anatomische Orientierung", "text": "KI-augmentierte OP-Lehrvideos helfen mir, mich anatomisch im Felsenbein besser zu orientieren."},
        {"id": "pre.2", "type": "likert", "scale": "agreement", "topic": "Erkennen und Benennen von Risikostrukturen", "text": "KI-Unterstützung kann hilfreich sein, kritische Risikostrukturen (z. B. N. facialis, Sinus sigmoideus, Dura) sicherer zu erkennen und zu benennen."},
        {"id": "pre.3", "type": "likert", "scale": "agreement", "topic": "Verständnis des operativen Ablaufs", "text": "KI-augmentierten Videos stellen den operativen Ablauf verständlicher dar als konventionelle Lehrvideos."},
        {"id": "pre.4", "type": "likert", "scale": "agreement", "topic": "Reduktion der kognitiven Belastung", "text": "KI-Augmentierung reduziert die kognitive Belastung beim Verständnis der OP-Schritte"},
        {"id": "pre.5", "type": "likert", "scale": "agreement", "topic": "Subjektiver Lernzuwachs", "text": "Ich erwarte einen höheren Lernzuwachs durch KI-augmentierte Lehrvideos."},
        {"id": "pre.6", "type": "likert", "scale": "agreement", "topic": "Klinische Relevanz für die spätere ärztliche Tätigkeit", "text": "KI-augmentierten Videos helfen, die klinische Relevanz der Felsenbein-OP für meine spätere ärztliche Tätigkeit besser zu verstehen, auch wenn ich diesen Eingriff nicht selbst durchführen werde."},
        {"id": "pre.7", "type": "likert", "scale": "agreement", "topic": "Erkennen kritischer Schritte und Komplikationen", "text": "KI-augmentierte Lehrvideos helfen, kritische operative Schritte und mögliche Komplikationen frühzeitig zu erkennen und einzuordnen."},
        {"id": "pre.8", "type": "likert", "scale": "agreement", "topic": "Übertragbarkeit auf das theoretische (Prüfungs-)Wissen", "text": "Ich erwarte, dass sich die Inhalte der KI-augmentierten Videos gut auf mein theoretisches Wissen und meine Prüfungsvorbereitung übertragen lassen."},
        {"id": "pre.9", "type": "likert", "scale": "agreement", "topic": "Nutzungsmotivation", "text": "Ich bin motiviert, KI-augmentierte OP-Lehrvideos zukünftig regelmäßig zu nutzen, um operative Fächer besser zu verstehen, auch wenn ich diese Eingriffe nicht selbst durchführen werde."},
        {"id": "pre.10", "type": "likert", "scale": "agreement", "topic": "Gesamteinschätzung des Mehrwerts", "text": "Ich erwarte, dass KI-augmentierte OP-Lehrvideos einen deutlichen Mehrwert gegenüber konventionellen Lehrvideos für mein Verständnis chirurgischer Eingriffe im Rahmen des Medizinstudiums bieten."},
      ],
    },
    {
      id: "mc",
      perItem: true,
      title: "Wissensfragen",
      intro: "Bitte wählen Sie bei jeder Frage genau eine Antwort.",
      items: [
        {"id": "mc.1", "type": "choice", "lettered": true, "text": "Welche Struktur bildet die mediale Begrenzung des Recessus facialis (posteriore Tympanotomie)?", "options": [{"value": "A", "label": "Chorda tympani"}, {"value": "B", "label": "Ambosskurzfortsatz (Fossa incudis)"}, {"value": "C", "label": "N. facialis (Pars mastoidea)"}, {"value": "D", "label": "Sinus sigmoideus"}, {"value": "E", "label": "Anulus tympanicus"}]},
        {"id": "mc.2", "type": "choice", "lettered": true, "text": "Welche anatomische Leitstruktur markiert bei der Kortikalis-Mastoidektomie die kraniale Grenze (Niveau des Tegmen tympani/Dura der mittleren Schädelgrube)?", "options": [{"value": "A", "label": "Sinus sigmoideus"}, {"value": "B", "label": "Chorda tympani"}, {"value": "C", "label": "Spina suprameatica (Henle-Spina)"}, {"value": "D", "label": "Linea temporalis"}, {"value": "E", "label": "Fossa incudis"}]},
        {"id": "mc.3", "type": "choice", "lettered": true, "text": "Welche Struktur dient intraoperativ typischerweise als Leitstruktur zum Auffinden des Aditus ad antrum?", "options": [{"value": "A", "label": "Chorda tympani"}, {"value": "B", "label": "Fossa incudis (kurzer Ambossfortsatz)"}, {"value": "C", "label": "Promontorium"}, {"value": "D", "label": "Sinus sigmoideus"}, {"value": "E", "label": "N. petrosus major"}]},
        {"id": "mc.4", "type": "choice", "lettered": true, "text": "Welcher Bogengang liegt dem Antrum am nächsten und dient als wichtige Leitstruktur zur Vermeidung von Verletzungen im Antrumbereich?", "options": [{"value": "A", "label": "Vorderer (superiorer) Bogengang"}, {"value": "B", "label": "Hinterer (posteriorer) Bogengang"}, {"value": "C", "label": "Lateraler (horizontaler) Bogengang"}, {"value": "D", "label": "Ductus cochlearis"}, {"value": "E", "label": "Ductus semicircularis communis"}]},
        {"id": "mc.5", "type": "choice", "lettered": true, "text": "Welcher Nerv verläuft im Recessus facialis lateral vom N. facialis und wird bei der posterioren Tympanotomie nach Möglichkeit geschont, um Geschmacksstörungen zu vermeiden?", "options": [{"value": "A", "label": "N. petrosus major"}, {"value": "B", "label": "N. tympanicus (Jacobson-Anastomose)"}, {"value": "C", "label": "Chorda tympani"}, {"value": "D", "label": "N. auricularis magnus"}, {"value": "E", "label": "N. stapedius"}]},
        {"id": "mc.6", "type": "choice", "lettered": true, "text": "Wo wird die Cochleostomie zur Elektrodeneinführung bei der Cochleaimplantation typischerweise angelegt?", "options": [{"value": "A", "label": "Direkt im runden Fenster selbst"}, {"value": "B", "label": "Anteroinferior der Rundfensternische, im Promontorium"}, {"value": "C", "label": "Am ovalen Fenster"}, {"value": "D", "label": "Im Bereich des Modiolus"}, {"value": "E", "label": "Am Übergang zum Vestibulum"}]},
        {"id": "mc.7", "type": "choice", "lettered": true, "text": "Über welche alternative Struktur kann die Elektrode statt über eine separate Cochleostomie in die Cochlea eingeführt werden?", "options": [{"value": "A", "label": "Membrana tympani (Trommelfell)"}, {"value": "B", "label": "Rundfenstermembran (Membrana tympani secundaria)"}, {"value": "C", "label": "Ligamentum anulare stapedis"}, {"value": "D", "label": "Fissula ante fenestram"}, {"value": "E", "label": "Fenestra vestibuli"}]},
        {"id": "mc.8", "type": "choice", "lettered": true, "text": "Welche Maßnahme ist während des Bohrens (z. B. bei Cochleostomie oder Mastoidektomie) im Video typischerweise als kontinuierliche Flüssigkeitszufuhr am Bohrer zu erkennen und dient dem Schutz vor Hitzeschäden?", "options": [{"value": "A", "label": "Kontinuierliche Spülung/Irrigation mit Kochsalzlösung"}, {"value": "B", "label": "Kurzzeitige Elektrokauterisation"}, {"value": "C", "label": "Lokale Kälteapplikation mit Eis"}, {"value": "D", "label": "Anwendung von Ultraschall"}, {"value": "E", "label": "Applikation von Adrenalintupfern"}]},
        {"id": "mc.9", "type": "choice", "lettered": true, "text": "Womit wird der Cochleostomie-/Rundfensterzugang nach Elektrodeneinführung typischerweise abgedichtet, um eine Perilymphfistel zu vermeiden?", "options": [{"value": "A", "label": "Knochenwachs"}, {"value": "B", "label": "Titanclip"}, {"value": "C", "label": "Bindegewebe/Faszie (z. B. Temporalisfaszie)"}, {"value": "D", "label": "Zementfüllung"}, {"value": "E", "label": "Keine Abdichtung notwendig"}]},
        {"id": "mc.10", "type": "choice", "lettered": true, "text": "Welcher Hautschnitt wird bei Mastoidektomie und Cochleaimplantation am häufigsten als Standardzugang verwendet?", "options": [{"value": "A", "label": "Präaurikulärer Schnitt"}, {"value": "B", "label": "Retroaurikulärer Schnitt"}, {"value": "C", "label": "Endauraler Schnitt nach Lempert"}, {"value": "D", "label": "Transkanalärer Zugang"}, {"value": "E", "label": "Suprameataler Bogenschnitt"}]},
      ],
    },
  ],
}
