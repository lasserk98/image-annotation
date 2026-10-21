// Answer scales shared by the surveys. Values run min..max; `labels` are the
// captions shown for those values (a scale may label only its ends). Wording
// comes from the study owner and must not be changed without confirmation.
export const SCALES = {
  agreement: {"min": 1, "max": 5, "labels": {"1": "stimmt voll zu", "2": "stimmt eher zu", "3": "teils/teils", "4": "stimmt eher nicht zu", "5": "stimmt nicht zu"}},
  frequency: {"min": 1, "max": 5, "labels": {"1": "sehr oft", "5": "nie"}},
  competence: {"min": 1, "max": 5, "labels": {"1": "sehr gut", "5": "sehr schlecht"}},
  // German school grades, used for the video quality ratings.
  grade: {"min": 1, "max": 6, "labels": {"1": "sehr gut", "2": "gut", "3": "befriedigend", "4": "ausreichend", "5": "mangelhaft", "6": "ungenügend"}},
}
