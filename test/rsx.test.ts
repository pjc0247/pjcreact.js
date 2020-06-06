import rsx, { registerType } from '../src/compiler/simple';
import 'mocha';

var assert = require('assert');

describe('jsx', function() {
  describe('instantiating', function() {
    it('should instantiate registered component', function() {
      const Root = () => 'it works!';
      registerType(Root);

      assert.equal(
        rsx('<Root />')(),
        Root(),
      );
    });
  });

  describe('attributes', function() {
    it('should parse trailing attributes', function() {
      const Root = ({ value }) => value;
      registerType(Root);

      assert.equal(
        rsx('<Root value="90" />')(),
        90,
      );
    });

    it('empty attributes should be treated as `true`', function() {
      const Root = ({ empty }) => empty;
      registerType(Root);

      assert.equal(
        rsx('<Root empty />')(),
        true,
      );
    });
  });
});