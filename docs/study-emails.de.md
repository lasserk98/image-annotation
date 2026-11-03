# E-Mail-Vorlagen für die Studie (Deutsch)

Zwei E-Mails: eine für **Phase 1 + 2** (eine Sitzung, mit dem Video dazwischen)
und eine einige Wochen später für **Phase 3**. Alles in `[eckigen Klammern]`
ist vor dem Versand zu ersetzen. Die Anrede ist in der Einwilligung formell
(„Sie“), die Oberfläche der Studie duzt – bei Bedarf einheitlich anpassen.

## Vor dem Versand

- **Persönlicher Link pro Person.** Die Teilnehmenden-ID steckt im Link und wird
  nie getippt oder angezeigt:
  `https://lasserk98.github.io/image-annotation/phase1/?id=P-0001`
  Dieselbe ID kommt in **alle drei Phasen** (`…/phase2/?id=P-0001`,
  `…/phase3/?id=P-0001`). Gibt es Gruppen, hängt `&treatment=A` bzw. `&treatment=B`
  an jeden Link (in allen Phasen gleich). Erlaubt sind in der ID nur Buchstaben,
  Ziffern, `.`, `_` und `-`.
- **Mail-Merge:** eine Tabelle mit den Spalten `ID`, `Gruppe` (falls nötig),
  `Link1`, `Link2`, `Link3` – die Links werden aus `…/phaseN/?id=<ID>` gebaut.
- **Dateinamen der Bilder auf Nextcloud:** `phase1.png` und `phase2.png` (auch
  `.jpg` o. Ä. geht; das Tool vergleicht den Namen ohne Endung).
- **Passwörter:** das Studienpasswort jeder Phase steht in
  `src/config/study.json` (`phase1Password` …). Die Nextcloud-Passwörter für
  Bilder und Video sind davon getrennt.
- **Upload-Link:** ein *Dateiabgabe*-Link (nur Hochladen) für alle Phasen. Die
  Dateinamen enthalten die Phase.
- **Video-Link:** Passwort, „Download verbergen“, wenn möglich Ablaufdatum.

---

## E-Mail 1: Phase 1 + 2

**Betreff:** Studie zur KI-gestützten Annotation von Lehrvideos – Ihre Schritte (ca. [XX] Minuten)

Liebe Teilnehmende,

vielen Dank für Ihre Teilnahme an der Studie. Bitte führen Sie die Schritte
unten **in dieser Reihenfolge** durch und nehmen Sie sich dafür [XX] Minuten
am Stück Zeit.

Sie benötigen: einen Computer mit Browser (Chrome, Edge, Firefox oder Safari)
sowie Lautsprecher oder Kopfhörer.

Ihre Teilnehmenden-ID steckt in Ihren persönlichen Links – bitte öffnen Sie
immer nur die Links aus dieser E-Mail.

### Schritt 1 – Phase 1

1. Bild herunterladen: [Link Bild 1] (Passwort: [Nextcloud-Passwort Bilder]).
   Die Datei heißt `phase1`.
2. Studie öffnen: [persönlicher Link Phase 1] (Passwort: [Studienpasswort Phase 1]).
3. Einwilligung lesen und bestätigen, dann den Fragebogen beantworten.
4. Danach das heruntergeladene Bild `phase1` in das Fenster ziehen und
   annotieren.
5. Auf **Exportieren** klicken. Es wird eine Datei heruntergeladen, deren Name
   auf `_phase1.json` endet.
6. Diese Datei hier hochladen: [Upload-Link].

### Schritt 2 – Video ansehen

[Link Video] (Passwort: [Nextcloud-Passwort Video]). Länge: ca. [X] Minuten.
Bitte sehen Sie das Video vollständig an.

### Schritt 3 – Phase 2

1. Bild herunterladen: [Link Bild 2] (Passwort: [Nextcloud-Passwort Bilder]).
   Die Datei heißt `phase2`.
2. Studie öffnen: [persönlicher Link Phase 2] (Passwort: [Studienpasswort Phase 2]).
3. Den Fragebogen beantworten.
4. Danach das heruntergeladene Bild `phase2` in das Fenster ziehen und
   annotieren.
5. Auf **Exportieren** klicken (Dateiname endet auf `_phase2.json`) und die
   Datei hier hochladen: [Upload-Link].

Ihre Bilder verlassen Ihren Browser nicht: hochgeladen werden nur die
Exportdateien mit Antworten und Markierungen.

Bei Fragen oder Problemen erreichen Sie uns unter [Kontakt].

Vielen Dank und freundliche Grüße
[Name]

---

## E-Mail 2: Phase 3 (einige Wochen später)

**Betreff:** Studie zur KI-gestützten Annotation von Lehrvideos – Nachbefragung (ca. [XX] Minuten)

Liebe Teilnehmende,

wie angekündigt folgt nun die Nachbefragung. Sie dauert ca. [XX] Minuten.

1. [Bild herunterladen: [Link Bild 3] (Passwort: [Nextcloud-Passwort Bilder])] –
   *nur falls die Nachbefragung ein eigenes Bild hat; sonst streichen.*
2. Studie öffnen: [persönlicher Link Phase 3] (Passwort: [Studienpasswort Phase 3]).
3. Den Fragebogen beantworten und das Bild annotieren.
4. Auf **Exportieren** klicken (Dateiname endet auf `_phase3.json`) und die
   Datei hier hochladen: [Upload-Link].

Bei Fragen erreichen Sie uns unter [Kontakt].

Vielen Dank und freundliche Grüße
[Name]
