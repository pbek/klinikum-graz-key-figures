export const getFilter1Mapping = () => {
  const data = [
    {"text": "Augen", "value": "AU"},
    {"text": "Chirurgie", "value": "CK"},
    {"text": "Derma", "value": "DK"},
    {"text": "Frauen", "value": "FK"},
    {"text": "HNO", "value": "HK"},
    {"text": "Interdisz. Chir.", "value": "IC"},
    {"text": "Inquisite", "value": "IN"},
    {"text": "Kinderchirurgie", "value": "KC"},
    {"text": "Kinderklinik", "value": "KK"},
    {"text": "Innere Medizin", "value": "MK"},
    {"text": "Neurochirurgie", "value": "NC"},
    {"text": "Neurologie", "value": "NK"},
    // {"text": "Ortho- Trauma", "value": "OR"},
    {"text": "Ortho- Trauma", "value": "OT"},
    {"text": "Psychiatrie", "value": "PK"},
    {"text": "Strahlentherapie", "value": "ST"},
    // {"text": "Unfallchirurgie", "value": "UC"},
    {"text": "Urologie", "value": "UK"},
    {"text": "Palliativ", "value": "UP"},
    {"text": "Zahnklinik", "value": "ZK"},
  ];

  return data;
}

export const getFilter2Mapping = (key) => {
  const data = {
    "AU": [
      "AU",
    ],
    "CK": [
      "CKAL", "CKGF", "CKGM", "CKHE", "CKPL", "CKTH", "CKTX",
    ],
    "DK": [
      "DK",
    ],
    "FK": [
      "FKGB", "FKAL",
    ],
    "HK": [
      "HNO",
    ],
    "AK": [
      "AKAL",
    ],
    "IN": [
      "IN",
    ],
    "KC": [
      "KCAL", "KCOR", "KCGM",
    ],
    "KK": [
      "KKAL", "KKGM", "KKHO", "KKNE", "KKPU",
    ],
    "MK": [
      "MKAN", "MKEN", "MKGE", "MKHM", "MKLU", "MKNE", "MKON", "MKRH", "MKGM",
    ],
    "ME": [
      "MEDRADEG",
    ],
    "NC": [
      "NC",
    ],
    "NK": [
      "NKAL", "MKGM", "NKSP", "NKAL",
    ],
    "OR": [
      "OR",
    ],
    "OT": [
      "OT",
    ],
    "PK": [
      "PK",
    ],
    "ST": [
      "ST",
    ],
    "UC": [
      "UC",
    ],
    "UK": [
      "UK",
    ],
    "UP": [
      "UP",
    ],
    "ZK": [
      "ZKMK",
    ],
  };

  return key === undefined ? [] : (data[key] || []);
}
