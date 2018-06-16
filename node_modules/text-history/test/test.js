'use strict';

const assert = require('chai').assert;
const DiffMatchPatch = require('diff-match-patch');
const md5 = require('md5');
const sha1 = require('sha1');

const TextHistory = require('../');

const diff = new DiffMatchPatch;

describe('TextHistory', function(){
  describe('#', function() {
    it("constructor should return an instance", function() {
      assert.isDefined(new TextHistory());
    });
    it("function should return an instance", function() {
      assert.isDefined(TextHistory());
    });
  });
  describe('#addVersion', function() {
    it('return md5 hash as id', function() {
      let text = new Date().toString();
      assert.strictEqual(TextHistory().addVersion(text), md5(text));
    });
    it('return id with custom function', function() {
      let text = new Date().toString();
      assert.strictEqual(TextHistory(sha1).addVersion(text), sha1(text));
    });
  });
  describe('#getVersion', function() {
    const NUM_VERSIONS = 10;
    let texts = [];
    for (let i = 0; i < NUM_VERSIONS; i++) {
      texts.push((new Date).toString());
    }

    let textHistory = new TextHistory();
    let ids = texts.map(textHistory.addVersion.bind(textHistory));
    it('get right text', function() {
      ids.forEach((id, index) => assert.strictEqual(textHistory.getVersion(id), texts[index]));
    });
    it('unknown version is undefined', function() {
      assert.isUndefined(textHistory.getVersion('unknown id'));
    });
  });
  describe('#hasVersion', function() {
    it('returns true if version exists', function() {
      let textHistory = new TextHistory();
      let id = textHistory.addVersion(new Date().toString());
      assert(textHistory.hasVersion(id));
    });
    it("returns false if version doesn't exist", function() {
      let textHistory = new TextHistory();
      let id = textHistory.addVersion(new Date().toString());
      assert.isFalse(textHistory.hasVersion('nonexisting id'));
    });
  });
  describe('#getPatches', function() {
    const NUM_VERSIONS = 10;
    let texts = [];
    for (let i = 0; i < NUM_VERSIONS; i++) {
      texts.push((new Date).toString());
    }

    let textHistory = new TextHistory();
    let ids = texts.map(textHistory.addVersion.bind(textHistory));

    it('patch correctly', function() {
      ids.forEach((id, index) => {
        let patches = textHistory.getPatches(id);
        assert.strictEqual(diff.patch_apply(patches, texts[index])[0], texts[texts.length - 1]);
      });
    });
  });

});
