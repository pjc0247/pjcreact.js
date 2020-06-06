
import 'mocha';
import { expect } from 'chai';
import render from '../src/render/render';
import { useMemo, useEffect } from '../src/hook/hook';

var assert = require('assert');

describe('hook', function() {
  describe('useMemo', function() {
    it('should produce a value at first run', function() {
      let v = null;
      const Root = () => {
        v = useMemo(() => 10, []);
      };
      render(() => Root());

      assert.equal(
        v,
        10
      );
    });

    it('should keep previous value with same deps', function() {
    });

    it('should throw an exception outside of react component', function() {
      expect(() => {
        useMemo(() => 10, []);
      }).to.throw();
    });
  });

  describe('useEffect', function() {
    it('should be called on every component render, with no deps param', function() {
    });
    it('should be called only once, with empty array deps param', function() {
    });

    it('should throw an exception outside of react component', function() {
      expect(() => {
        useEffect(() => {}, []);
      }).to.throw();
    });
  });
});