/**
 * Pure-logic tests for RoroRepeatable (no DOM required).
 *
 * All methods are invoked via prototype.call with a hand-crafted context object
 * so the test suite never touches the DOM.  The contract asserted here is what
 * any future rewrite must preserve.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { loadRoro } from './helpers/roroEnv.js';

beforeAll(() => loadRoro());

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal repeatable context. */
function ctx(overrides = {}) {
    return {
        indexed: true,
        prefix: 'contacts',
        token: '',
        ...overrides,
    };
}

/** Short aliases for the prototype methods under test.
 *  All access window.RoroRepeatable lazily (inside test functions) so they
 *  run after beforeAll() has loaded the runtime.
 */
function namePath(name, ctxObj) {
    return window.RoroRepeatable.prototype.namePath.call(ctxObj ?? ctx(), name);
}
function indexName(name, index, ctxObj) {
    return window.RoroRepeatable.prototype.indexName.call(ctxObj ?? ctx(), name, index);
}
function deindex(name, ctxObj) {
    return window.RoroRepeatable.prototype.deindex.call(ctxObj ?? ctx(), name);
}
function fillKey(name, ctxObj) {
    return window.RoroRepeatable.prototype.fillKey.call(ctxObj ?? ctx(), name);
}
// Static helpers — accessed via getters so they resolve after beforeAll.
function bracketize(base) { return window.RoroRepeatable.bracketize(base); }
function setPath(obj, path, value, isArray) { return window.RoroRepeatable.setPath(obj, path, value, isArray); }
function stripArray(name) { return window.RoroRepeatable.stripArray(name); }
function cssEsc(v) { return window.RoroRepeatable.cssEsc(v); }

// ---------------------------------------------------------------------------
// namePath
// ---------------------------------------------------------------------------

describe('namePath', () => {
    it('splits a nested name into path segments', () => {
        expect(namePath('addr[city]')).toEqual(['addr', 'city']);
    });

    it('strips the trailing [] from an array name', () => {
        // 'tags[]' -> [] captured a single segment: ['tags']
        expect(namePath('tags[]')).toEqual(['tags']);
    });

    it('returns a single-element array for a plain name', () => {
        expect(namePath('number')).toEqual(['number']);
    });

    it('handles deeply nested names', () => {
        expect(namePath('a[b][c]')).toEqual(['a', 'b', 'c']);
    });

    it('handles a double-bracket array suffix', () => {
        // 'items[tags][]' -> ['items','tags']
        expect(namePath('items[tags][]')).toEqual(['items', 'tags']);
    });
});

// ---------------------------------------------------------------------------
// bracketize (static)
// ---------------------------------------------------------------------------

describe('bracketize', () => {
    it('wraps a plain name in brackets', () => {
        expect(bracketize('number')).toBe('[number]');
    });

    it('keeps trailing [] on an array name', () => {
        expect(bracketize('tags[]')).toBe('[tags][]');
    });

    it('handles a nested name', () => {
        expect(bracketize('a[b]')).toBe('[a][b]');
    });

    it('handles a deeply nested name', () => {
        expect(bracketize('a[b][c]')).toBe('[a][b][c]');
    });
});

// ---------------------------------------------------------------------------
// setPath (static)
// ---------------------------------------------------------------------------

describe('setPath', () => {
    it('sets a top-level property', () => {
        const obj = {};
        setPath(obj, ['name'], 'Alice', false);
        expect(obj).toEqual({ name: 'Alice' });
    });

    it('sets a nested property', () => {
        const obj = {};
        setPath(obj, ['addr', 'city'], 'Paris', false);
        expect(obj).toEqual({ addr: { city: 'Paris' } });
    });

    it('pushes onto an array when isArray=true', () => {
        const obj = {};
        setPath(obj, ['tags'], 'red', true);
        setPath(obj, ['tags'], 'blue', true);
        expect(obj).toEqual({ tags: ['red', 'blue'] });
    });

    it('initializes an empty array before the first push', () => {
        const obj = {};
        setPath(obj, ['tags'], 'only', true);
        expect(obj.tags).toEqual(['only']);
    });

    it('merges into an existing object for nested paths', () => {
        const obj = { addr: { zip: '75000' } };
        setPath(obj, ['addr', 'city'], 'Paris', false);
        expect(obj).toEqual({ addr: { zip: '75000', city: 'Paris' } });
    });

    it('handles a three-level deep path', () => {
        const obj = {};
        setPath(obj, ['a', 'b', 'c'], 42, false);
        expect(obj).toEqual({ a: { b: { c: 42 } } });
    });

    it('overwrites an existing scalar value when isArray=false', () => {
        const obj = { x: 'old' };
        setPath(obj, ['x'], 'new', false);
        expect(obj.x).toBe('new');
    });
});

// ---------------------------------------------------------------------------
// stripArray (static)
// ---------------------------------------------------------------------------

describe('stripArray', () => {
    it('removes a trailing [] suffix', () => {
        expect(stripArray('tags[]')).toBe('tags');
    });

    it('leaves a plain name untouched', () => {
        expect(stripArray('name')).toBe('name');
    });

    it('leaves a nested name with no trailing [] untouched', () => {
        expect(stripArray('addr[city]')).toBe('addr[city]');
    });

    it('handles a null input gracefully', () => {
        expect(stripArray(null)).toBe('');
    });

    it('handles an undefined input gracefully', () => {
        expect(stripArray(undefined)).toBe('');
    });

    it('only strips a single trailing []', () => {
        // 'a[][]' only the very last [] should be stripped
        expect(stripArray('a[][]')).toBe('a[]');
    });
});

// ---------------------------------------------------------------------------
// cssEsc (static)
// ---------------------------------------------------------------------------

describe('cssEsc', () => {
    it('leaves a plain string untouched', () => {
        expect(cssEsc('my-id')).toBe('my-id');
    });

    it('escapes a double-quote character', () => {
        expect(cssEsc('say"hi"')).toBe('say\\"hi\\"');
    });

    it('escapes a backslash character', () => {
        expect(cssEsc('a\\b')).toBe('a\\\\b');
    });

    it('handles null gracefully', () => {
        expect(cssEsc(null)).toBe('');
    });

    it('handles undefined gracefully', () => {
        expect(cssEsc(undefined)).toBe('');
    });

    it('converts numbers to strings', () => {
        expect(cssEsc(42)).toBe('42');
    });
});

// ---------------------------------------------------------------------------
// indexName — auto-prefix mode (prefix="contacts", token="")
// ---------------------------------------------------------------------------

describe('indexName — auto-prefix mode', () => {
    const c = ctx({ indexed: true, prefix: 'contacts', token: '' });

    it('wraps a plain field name', () => {
        expect(indexName('name', 0, c)).toBe('contacts[0][name]');
    });

    it('wraps a nested field name', () => {
        expect(indexName('addr[city]', 0, c)).toBe('contacts[0][addr][city]');
    });

    it('wraps an array field name', () => {
        expect(indexName('tags[]', 0, c)).toBe('contacts[0][tags][]');
    });

    it('uses the correct index number', () => {
        expect(indexName('name', 3, c)).toBe('contacts[3][name]');
    });
});

// ---------------------------------------------------------------------------
// indexName — token mode (token="#")
// ---------------------------------------------------------------------------

describe('indexName — token mode', () => {
    const c = ctx({ indexed: true, prefix: 'contacts', token: '#' });

    it('replaces the token with the index', () => {
        expect(indexName('contacts[#][name]', 2, c)).toBe('contacts[2][name]');
    });

    it('replaces the token in an array name', () => {
        expect(indexName('tags[#]', 2, c)).toBe('tags[2]');
    });

    it('replaces the token using the correct index value', () => {
        expect(indexName('contacts[#][email]', 5, c)).toBe('contacts[5][email]');
    });
});

// ---------------------------------------------------------------------------
// indexName — indexed=false
// ---------------------------------------------------------------------------

describe('indexName — indexed=false', () => {
    const c = ctx({ indexed: false, prefix: 'contacts', token: '' });

    it('returns the name verbatim', () => {
        expect(indexName('name', 0, c)).toBe('name');
    });

    it('returns a nested name verbatim', () => {
        expect(indexName('addr[city]', 1, c)).toBe('addr[city]');
    });
});

// ---------------------------------------------------------------------------
// deindex — auto-prefix mode (inverse of indexName)
// ---------------------------------------------------------------------------

describe('deindex — auto-prefix mode', () => {
    const c = ctx({ indexed: true, prefix: 'contacts', token: '' });

    it('strips prefix + index to recover plain field name', () => {
        expect(deindex('contacts[0][name]', c)).toBe('name');
    });

    it('strips prefix + index from a nested field name', () => {
        expect(deindex('contacts[0][addr][city]', c)).toBe('addr[city]');
    });

    it('strips prefix + index from an array field name', () => {
        expect(deindex('contacts[0][tags][]', c)).toBe('tags[]');
    });

    it('strips using any index value, not just 0', () => {
        expect(deindex('contacts[7][name]', c)).toBe('name');
    });
});

// ---------------------------------------------------------------------------
// deindex — indexed=false
// ---------------------------------------------------------------------------

describe('deindex — indexed=false', () => {
    const c = ctx({ indexed: false, prefix: 'contacts', token: '' });

    it('returns the name verbatim', () => {
        expect(deindex('contacts[0][name]', c)).toBe('contacts[0][name]');
    });

    it('returns a plain name verbatim', () => {
        expect(deindex('name', c)).toBe('name');
    });
});

// ---------------------------------------------------------------------------
// deindex — empty / falsy names
// ---------------------------------------------------------------------------

describe('deindex — falsy input', () => {
    const c = ctx();

    it('returns an empty string for an empty input', () => {
        expect(deindex('', c)).toBe('');
    });

    it('returns an empty string for null', () => {
        expect(deindex(null, c)).toBe('');
    });
});

// ---------------------------------------------------------------------------
// fillKey — auto-prefix mode
// ---------------------------------------------------------------------------

describe('fillKey — auto-prefix mode', () => {
    const c = ctx({ indexed: true, prefix: 'contacts', token: '' });

    it('returns the name unchanged (relative name is already the data key)', () => {
        expect(fillKey('name', c)).toBe('name');
    });

    it('returns a nested name unchanged', () => {
        expect(fillKey('addr[city]', c)).toBe('addr[city]');
    });

    it('returns an array name unchanged', () => {
        expect(fillKey('tags[]', c)).toBe('tags[]');
    });
});

// ---------------------------------------------------------------------------
// fillKey — token mode
// ---------------------------------------------------------------------------

describe('fillKey — token mode', () => {
    const c = ctx({ indexed: true, prefix: 'contacts', token: '#' });

    it('strips prefix + [#] and un-brackets the field segment', () => {
        expect(fillKey('contacts[#][name]', c)).toBe('name');
    });

    it('returns the name unchanged when the token is embedded but the name does not start with [', () => {
        // 'tags[#]' contains the token '#', but the regex that drops the
        // [#] segment only fires when the string begins with '['.
        // Since 'tags[#]' starts with 't', neither replace fires, and the
        // name is returned as-is.  This is the actual behaviour.
        expect(fillKey('tags[#]', c)).toBe('tags[#]');
    });

    it('handles a name that has the prefix and token', () => {
        expect(fillKey('contacts[#][email]', c)).toBe('email');
    });

    it('strips to empty string for a flat scalar when the prefix IS the base name', () => {
        // 'contacts[#]' -> prefix stripped -> '[#]' -> drop [#] -> '' -> no un-bracket needed -> ''
        expect(fillKey('contacts[#]', c)).toBe('');
    });
});

// ---------------------------------------------------------------------------
// fillKey — indexed=false
// ---------------------------------------------------------------------------

describe('fillKey — indexed=false', () => {
    const c = ctx({ indexed: false, prefix: 'contacts', token: '#' });

    it('returns the name unchanged when indexed=false', () => {
        expect(fillKey('contacts[#][name]', c)).toBe('contacts[#][name]');
    });
});

// ---------------------------------------------------------------------------
// fillKey — falsy name
// ---------------------------------------------------------------------------

describe('fillKey — falsy input', () => {
    const c = ctx();

    it('returns null when name is null', () => {
        expect(fillKey(null, c)).toBe(null);
    });

    it('returns empty string when name is empty string', () => {
        expect(fillKey('', c)).toBe('');
    });
});

// ---------------------------------------------------------------------------
// Round-trip: indexName then deindex
// ---------------------------------------------------------------------------

describe('indexName / deindex round-trip', () => {
    const c = ctx({ indexed: true, prefix: 'contacts', token: '' });

    it('recovers a plain field name after indexing', () => {
        const indexed = indexName('name', 0, c);
        expect(deindex(indexed, c)).toBe('name');
    });

    it('recovers a nested field name after indexing', () => {
        const indexed = indexName('addr[city]', 1, c);
        expect(deindex(indexed, c)).toBe('addr[city]');
    });

    it('recovers an array field name after indexing', () => {
        const indexed = indexName('tags[]', 2, c);
        expect(deindex(indexed, c)).toBe('tags[]');
    });
});
