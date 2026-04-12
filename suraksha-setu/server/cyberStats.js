/**
 * Published official / NCRB / MHA–cited figures (rounded for display).
 * Update when new NCRB Crime in India or MHA Lok Sabha replies are released.
 *
 * m1: NCRP (cybercrime.gov.in) complaints registered in 2024 — widely cited
 *     from MHA / Lok Sabha (e.g. ~22.68 lakh in 2024).
 * m2: Cybercrime cases registered in India (police / NCRB), 2023 — 86,420
 *     (Crime in India 2023, reported in national press).
 * m3: Persons convicted in cybercrime cases, India, 2022 — 1,107
 *     (NCRB-based totals cited in press; convictions are post-trial outcomes).
 */
function getCyberStats() {
  return {
    asOf: "2026-04",
    m1: "22.68L",
    m2: "86,420",
    m3: "1,107",
    detail:
      "NCRP (portal complaints) and NCRB (FIRs) measure different things; conviction counts reflect court outcomes for a given year.",
  };
}

module.exports = { getCyberStats };
