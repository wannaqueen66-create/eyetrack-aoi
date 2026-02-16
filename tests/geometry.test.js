/* eslint-disable no-console */
const assert = require('assert');
const Geom = require('../public/geometry.js');

function testArea(){
  const sq = [[0,0],[2,0],[2,2],[0,2]];
  assert.strictEqual(Geom.polygonArea(sq), 4);
}

function testPointInPoly(){
  const sq = [[0,0],[10,0],[10,10],[0,10]];
  assert.strictEqual(Geom.pointInPoly(5,5,sq), true);
  assert.strictEqual(Geom.pointInPoly(-1,5,sq), false);
}

function testSelfIntersect(){
  // bow-tie
  const bow = [[0,0],[10,10],[0,10],[10,0]];
  assert.strictEqual(Geom.polygonSelfIntersects(bow), true);
}

function testValidate(){
  const aois = {
    ok: [{points:[[0,0],[10,0],[10,10],[0,10]]}],
    bad: [{points:[[0,0],[10,0],[0,0]]}],
    self: [{points:[[0,0],[10,10],[0,10],[10,0]]}],
  };
  const warnings = Geom.validateAoIs(aois);
  assert.ok(warnings.some(w => w.includes('bad#1')));
  assert.ok(warnings.some(w => w.includes('self#1')));
}

function main(){
  testArea();
  testPointInPoly();
  testSelfIntersect();
  testValidate();
  console.log('geometry tests: OK');
}

main();
