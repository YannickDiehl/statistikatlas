import test from 'node:test';
import assert from 'node:assert/strict';
import { itemOf, jugend, nichtwahl, osten } from './claims';
import { rParts, rScript } from './rcode';

test('writes the default path as tidy mariposa code', () => {
  assert.equal(rScript(jugend, jugend.defaults, itemOf(jugend, 'pa02a'), 'row', 'ZA8831_v1-3-0.sav'), `library(mariposa)
library(dplyr)

allbus <- read_spss("ZA8831_v1-3-0.sav")   # fehlende Angaben werden zu getaggten NAs

allbus <- allbus %>%
  mutate(
    altersgruppe = rec(age, rules = "18:29=1 [18–29]; 30:max=2 [30 und älter]; else=NA"),
    interessiert = rec(pa02a, rules = "1:2=1 [interessiert]; 3:5=0 [nicht interessiert]; else=NA")
  )

allbus %>%
  crosstab(altersgruppe, interessiert, percentages = "row") %>%
  summary()
`);
});

test('translates missing modes, exclusions, weights and base', () => {
  const trust = rParts(osten, { ...osten.defaults, exclude: [4], missing: { mode: 'allAsNo' }, weighted: true }, itemOf(osten, 'pt03'), 'col', 'a.sav');
  assert.match(trust.setup, /vertrauen = rec\(pt03, rules = "NA=0; 5:7=1 \[vertraut\]; 1:3=0 \[vertraut nicht\]; 4=NA; else=NA"\)/);
  assert.match(trust.setup, /region = rec\(eastwest, rules = "2=1 \[Osten\]; 1=2 \[Westen\]; else=NA"\)/);
  assert.match(trust.table, /percentages = "col",\n {11}weights = wghtpew\)/);
  const vote = rParts(nichtwahl, { ...nichtwahl.defaults, missing: { mode: 'codesAsYes', codes: [-8, -7] } }, itemOf(nichtwahl, 'pe01'), 'row', 'a.sav');
  assert.match(vote.setup, /nichtwahl = rec\(untag_na\(pv01\), rules = "-8:-7=1; 91=1 \[nicht wählen\]; 1:4=0 \[wählen\]; 6=0; 42=0; 90=0; else=NA"\)/);
  assert.match(vote.setup, /misstrauen = rec\(pe01, rules = "1=1 \[misstraut\]; 2:4=2 \[übrige\]; else=NA"\)/);
  const mid = rParts(jugend, { ...jugend.defaults, comparison: 'senior', positive: [1, 3] }, itemOf(jugend, 'pa02a'), 'row', 'a.sav');
  assert.match(mid.setup, /"18:29=1 \[18–29\]; 60:max=2 \[60 und älter\]; else=NA"/);
  assert.match(mid.setup, /"1=1 \[interessiert\]; 3=1; 2=0 \[nicht interessiert\]; 4:5=0; else=NA"/);
});
