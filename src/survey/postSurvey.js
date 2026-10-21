// The fixed post-intervention survey, as data. Wording comes from the study
// owner and must not be changed without their confirmation. Answers are stored
// raw by item id; this file deliberately has no field for a correct answer,
// and no scoring lives in this repository.
//
// Every item is required. All sections show one question per page.

export const POST_SURVEY = {
  version: "post-1",
  title: "Potenziale KI-augmentierter OP-Lehrvideos in der Felsenbeinchirurgie",
  sections: [
    {
      id: "post",
      perItem: true,
      title: "Postinterventioneller Fragebogen",
      intro: "Bitte geben Sie an, wie sehr Sie den folgenden Aussagen zustimmen.",
      items: [
        {"id": "post.1", "type": "likert", "scale": "agreement", "topic": "Anatomische Orientierung", "text": "Die KI-augmentierten OP-Lehrvideos haben mir geholfen, mich anatomisch am Felsenbein besser zu orientieren."},
        {"id": "post.2", "type": "likert", "scale": "agreement", "topic": "Erkennen und Benennen von Risikostrukturen", "text": "Die KI-Unterstützung hat mir geholfen, kritische Risikostrukturen sicherer zu erkennen und zu benennen."},
        {"id": "post.3", "type": "likert", "scale": "agreement", "topic": "Verständnis des operativen Ablaufs", "text": "Die KI-augmentierten Videos haben den operativen Ablauf verständlicher dargestellt als konventionelle Lehrvideos."},
        {"id": "post.4", "type": "likert", "scale": "agreement", "topic": "Reduktion der kognitiven Belastung", "text": "Die KI-Augmentierung hat mir geholfen, die kognitive Belastung beim Verständnis der OP-Schritte zu reduzieren."},
        {"id": "post.5", "type": "likert", "scale": "agreement", "topic": "Subjektiver Lernzuwachs", "text": "Ich habe einen höheren Lernzuwachs durch die KI-augmentierten OP-Lehrvideos erlebt."},
        {"id": "post.6", "type": "likert", "scale": "agreement", "topic": "Klinische Relevanz für die spätere ärztliche Tätigkeit", "text": "Die KI-augmentierten Videos haben mir geholfen, die klinische Relevanz der Felsenbein-OP für meine spätere ärztliche Tätigkeit besser zu verstehen, auch wenn ich diesen Eingriff nicht selbst durchführen werde."},
        {"id": "post.7", "type": "likert", "scale": "agreement", "topic": "Erkennen kritischer Schritte und Komplikationen", "text": "Die KI-augmentierten Lehrvideos haben mir geholfen, kritische operative Schritte und mögliche Komplikationen frühzeitig zu erkennen und einzuordnen."},
        {"id": "post.8", "type": "likert", "scale": "agreement", "topic": "Übertragbarkeit auf das theoretische (Prüfungs-)Wissen", "text": "Die Inhalte der KI-augmentierten Videos ließen sich gut auf mein theoretisches Wissen und meine Prüfungsvorbereitung übertragen."},
        {"id": "post.9", "type": "likert", "scale": "agreement", "topic": "Nutzungsmotivation", "text": "Ich bin motiviert, KI-augmentierte OP-Lehrvideos zukünftig regelmäßig zu nutzen, um operative Fächer besser zu verstehen, auch wenn ich diese Eingriffe nicht selbst durchführen werde."},
        {"id": "post.10", "type": "likert", "scale": "agreement", "topic": "Gesamteinschätzung des Mehrwerts", "text": "KI-augmentierte OP-Lehrvideos bieten einen deutlichen Mehrwert gegenüber konventionellen Lehrvideos für mein Verständnis chirurgischer Eingriffe im Rahmen des Medizinstudiums."},
      ],
    },
    {
      id: "ai",
      perItem: true,
      title: "Qualitätsbewertung des KI-augmentierten Lehrvideos (Schulnoten 1–6)",
      intro: "Bewertungsskala: 1 = sehr gut · 2 = gut · 3 = befriedigend · 4 = ausreichend · 5 = mangelhaft · 6 = ungenügend",
      items: [
        {"id": "ai.1", "type": "likert", "scale": "grade", "topic": "Bild-/Videoqualität", "text": "Wie bewerten Sie die Bildqualität des Videos (Auflösung, Schärfe, Sichtbarkeit des OP-Situs)?"},
        {"id": "ai.2", "type": "likert", "scale": "grade", "topic": "Tonqualität", "text": "Wie bewerten Sie die Tonqualität (Verständlichkeit des Kommentars, Nebengeräusche)?"},
        {"id": "ai.3", "type": "likert", "scale": "grade", "topic": "Qualität der KI-Annotationen", "text": "Wie bewerten Sie die Verständlichkeit und Genauigkeit der KI-generierten Annotationen (z. B. Beschriftung anatomischer Strukturen)?"},
        {"id": "ai.4", "type": "likert", "scale": "grade", "topic": "Synchronität der Annotationen", "text": "Wie bewerten Sie die zeitliche Passung der Annotationen zum tatsächlichen OP-Geschehen?"},
        {"id": "ai.5", "type": "likert", "scale": "grade", "topic": "Gesamtqualität", "text": "Wie bewerten Sie das KI-augmentierte Lehrvideo insgesamt?"},
      ],
    },
    {
      id: "conv",
      perItem: true,
      title: "Qualitätsbewertung des konventionellen Lehrvideos (Schulnoten 1–6)",
      intro: "Bewertungsskala: 1 = sehr gut · 2 = gut · 3 = befriedigend · 4 = ausreichend · 5 = mangelhaft · 6 = ungenügend",
      items: [
        {"id": "conv.1", "type": "likert", "scale": "grade", "topic": "Bild-/Videoqualität", "text": "Wie bewerten Sie die Bildqualität des Videos (Auflösung, Schärfe, Sichtbarkeit des OP-Situs)?"},
        {"id": "conv.2", "type": "likert", "scale": "grade", "topic": "Tonqualität", "text": "Wie bewerten Sie die Tonqualität (Verständlichkeit des Kommentars, Nebengeräusche)?"},
        {"id": "conv.3", "type": "likert", "scale": "grade", "topic": "Gesamtqualität", "text": "Wie bewerten Sie das Lehrvideo insgesamt?"},
      ],
    },
  ],
}
