export const getFilter1Mapping = () => {
  const data = [
    {"text": "Augen", "value": "AU"},
    {"text": "Chirurgie", "value": "CK"},
    {"text": "Derma", "value": "DK"},
    {"text": "Frauen", "value": "FK"},
    {"text": "HNO", "value": "HK"},
    {"text": "Interdisz. Chir.", "value": "AK"},
    {"text": "Inquisite", "value": "IN"},
    {"text": "Kinderchirurgie", "value": "KC"},
    {"text": "Kinderklinik", "value": "KK"},
    {"text": "Innere Medizin", "value": "MK"},
    {"text": "Neurochirurgie", "value": "NC"},
    {"text": "Neurologie", "value": "NK"},
    {"text": "Ortho- Trauma", "value": "OR"},
    {"text": "Ortho- Trauma", "value": "OT"},
    {"text": "Psychiatrie", "value": "PK"},
    {"text": "Strahlentherapie", "value": "ST"},
    {"text": "Unfallchirurgie", "value": "UC"},
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
      "CKAL", "CKGF",
    ]
  };

  return key === undefined ? [] : (data[key] || []);
}
