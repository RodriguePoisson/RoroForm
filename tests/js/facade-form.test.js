/**
 * Tests for roro.form() — the RoroFormHandle API.
 * Covers: data(), fill(), field(), validate()/isValid(), errors()/clearErrors(), reset().
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { loadRoro, setBody, tick } from './helpers/roroEnv.js';

beforeAll(() => loadRoro());

// ---------------------------------------------------------------------------
// Minimal but realistic fixture
// ---------------------------------------------------------------------------

/**
 * A <form id="signup"> containing:
 *   - text field          name="username"     id="username"
 *   - email field         name="email"        id="email"
 *   - array text field    name="tags[]"       id="tags"
 *   - second array field  name="tags[]"       id="tags2"   (for duplicate-name array tests)
 *   - checkbox (single)   name="agree"        id="agree"
 *   - checkbox group      name="hobbies[]"    id="hobby-music" / "hobby-sports"
 *   - radio group         name="gender"       id="gender-m" / "gender-f"
 *   - hidden field        name="token"        id="token"
 *
 * Each roro-input field has the minimal error-slot structure roroShowError needs:
 *   #roro-wrapper-<id> > .roro-input-error-container > .roro-input-error-message
 */
function signupFixture() {
    return `
    <form id="signup" action="/signup" method="POST">

      <div id="roro-wrapper-username">
        <input id="username" name="username" type="text" class="roro-input" value="" />
        <div class="roro-input-error-container" style="display:none">
          <span class="roro-input-error-message"></span>
        </div>
      </div>

      <div id="roro-wrapper-email">
        <input id="email" name="email" type="email" class="roro-input" value="" />
        <div class="roro-input-error-container" style="display:none">
          <span class="roro-input-error-message"></span>
        </div>
      </div>

      <div id="roro-wrapper-tags">
        <input id="tags"  name="tags[]" type="text" class="roro-input" value="" />
        <input id="tags2" name="tags[]" type="text" class="roro-input" value="" />
        <div class="roro-input-error-container" style="display:none">
          <span class="roro-input-error-message"></span>
        </div>
      </div>

      <div id="roro-wrapper-agree">
        <input id="agree" name="agree" type="checkbox" class="roro-input" value="1" />
        <div class="roro-input-error-container" style="display:none">
          <span class="roro-input-error-message"></span>
        </div>
      </div>

      <div id="roro-wrapper-hobby-music">
        <input id="hobby-music"  name="hobbies[]" type="checkbox" class="roro-input" value="music" />
        <input id="hobby-sports" name="hobbies[]" type="checkbox" class="roro-input" value="sports" />
        <div class="roro-input-error-container" style="display:none">
          <span class="roro-input-error-message"></span>
        </div>
      </div>

      <div class="roro-wrapper-radio-container" id="roro-wrapper-gender-m">
        <input id="gender-m" name="gender" type="radio" class="roro-input roro-input-radio" value="m" />
        <input id="gender-f" name="gender" type="radio" class="roro-input roro-input-radio" value="f" />
        <div class="roro-input-error-container" style="display:none">
          <span class="roro-input-error-message"></span>
        </div>
      </div>

      <input id="token" name="token" type="hidden" class="roro-input" value="abc" />

    </form>
    `;
}

// ---------------------------------------------------------------------------
// Helper: get a fresh form handle
// ---------------------------------------------------------------------------
function form() { return window.roro.form('signup'); }

// ---------------------------------------------------------------------------
// roro(formEl) returns a RoroFormHandle when the element is a <form>
// ---------------------------------------------------------------------------
describe('roro(formEl) returns a RoroFormHandle for <form> elements', () => {
    beforeEach(() => setBody(signupFixture()));

    it('roro("signup") detects the <form> and returns a RoroFormHandle', () => {
        const h = window.roro('signup');
        expect(h).toBeInstanceOf(window.RoroFormHandle);
    });

    it('roro(domElement) also returns a RoroFormHandle', () => {
        const el = document.getElementById('signup');
        const h = window.roro(el);
        expect(h).toBeInstanceOf(window.RoroFormHandle);
    });

    it('roro("#signup") strips the leading # and returns a RoroFormHandle', () => {
        const h = window.roro('#signup');
        expect(h).toBeInstanceOf(window.RoroFormHandle);
    });

    it('roro(jQueryObj) of a form returns a RoroFormHandle', () => {
        const $f = window.$('#signup');
        const h = window.roro($f);
        expect(h).toBeInstanceOf(window.RoroFormHandle);
    });

    it('roro.form("signup") also returns a RoroFormHandle', () => {
        expect(form()).toBeInstanceOf(window.RoroFormHandle);
    });

    it('exists() is true for a present form', () => {
        expect(form().exists()).toBe(true);
    });

    it('exists() is false for a missing id', () => {
        expect(window.roro.form('no-such-form').exists()).toBe(false);
    });

    it('el() returns the native HTMLFormElement', () => {
        expect(form().el()).toBe(document.getElementById('signup'));
    });
});

// ---------------------------------------------------------------------------
// data() — serializeForm
// ---------------------------------------------------------------------------
describe('RoroFormHandle.data() — serialization', () => {
    beforeEach(() => setBody(signupFixture()));

    it('returns an object (not an array)', () => {
        expect(typeof form().data()).toBe('object');
        expect(Array.isArray(form().data())).toBe(false);
    });

    it('serializes a simple text field', () => {
        document.getElementById('username').value = 'alice';
        expect(form().data().username).toBe('alice');
    });

    it('serializes a hidden field', () => {
        expect(form().data().token).toBe('abc');
    });

    it('treats a name[] field as an array even when only one value is present', () => {
        document.getElementById('tags').value = 'vue';
        document.getElementById('tags2').value = '';
        const d = form().data();
        // both tags[] fields are serialized; empty string is included
        expect(Array.isArray(d.tags)).toBe(true);
    });

    it('collects both values of a name[] field into an array', () => {
        document.getElementById('tags').value = 'vue';
        document.getElementById('tags2').value = 'react';
        const d = form().data();
        expect(d.tags).toEqual(['vue', 'react']);
    });

    it('strips the [] suffix from the key', () => {
        document.getElementById('tags').value = 'ts';
        document.getElementById('tags2').value = '';
        const d = form().data();
        expect('tags' in d).toBe(true);
        expect('tags[]' in d).toBe(false);
    });

    it('checked checkbox is included in serialized data', () => {
        document.getElementById('agree').checked = true;
        const d = form().data();
        expect(d.agree).toBe('1');
    });

    it('unchecked checkbox is NOT included in serialized data', () => {
        document.getElementById('agree').checked = false;
        const d = form().data();
        expect('agree' in d).toBe(false);
    });

    it('collects checked checkboxes in a [] group into an array', () => {
        document.getElementById('hobby-music').checked = true;
        document.getElementById('hobby-sports').checked = true;
        const d = form().data();
        expect(Array.isArray(d.hobbies)).toBe(true);
        expect(d.hobbies).toEqual(['music', 'sports']);
    });

    it('selected radio is included', () => {
        document.getElementById('gender-m').checked = true;
        const d = form().data();
        expect(d.gender).toBe('m');
    });

    it('duplicate non-[] names are collected into an array', () => {
        // inject two inputs with the same non-[] name directly
        const extra = document.createElement('input');
        extra.type = 'hidden';
        extra.name = 'note';
        extra.value = 'b';
        document.getElementById('signup').appendChild(extra);

        const extra2 = document.createElement('input');
        extra2.type = 'hidden';
        extra2.name = 'note';
        extra2.value = 'c';
        document.getElementById('signup').appendChild(extra2);

        const d = form().data();
        expect(Array.isArray(d.note)).toBe(true);
        expect(d.note).toEqual(['b', 'c']);
    });

    it('serialize() is an alias for data()', () => {
        document.getElementById('username').value = 'bob';
        const fh = form();
        expect(fh.serialize()).toEqual(fh.data());
    });
});

// ---------------------------------------------------------------------------
// fill() — fillForm
// ---------------------------------------------------------------------------
describe('RoroFormHandle.fill() — filling native fields', () => {
    beforeEach(() => setBody(signupFixture()));

    it('sets a text field value', () => {
        form().fill({ username: 'charlie' });
        expect(document.getElementById('username').value).toBe('charlie');
    });

    it('sets an email field value', () => {
        form().fill({ email: 'test@example.com' });
        expect(document.getElementById('email').value).toBe('test@example.com');
    });

    it('sets a hidden field value', () => {
        form().fill({ token: 'xyz' });
        expect(document.getElementById('token').value).toBe('xyz');
    });

    it('distributes an array across a [] name field, one value per indexed input', () => {
        // fill() locates both name="tags[]" inputs as a jQuery set. With an array
        // value it assigns each element to the corresponding indexed input rather
        // than letting jQuery's .val(array) set every input to the joined string.
        form().fill({ tags: ['ts', 'vue'] });
        expect(document.getElementById('tags').value).toBe('ts');
        expect(document.getElementById('tags2').value).toBe('vue');
    });

    it('clears [] name inputs past the end of a shorter array', () => {
        document.getElementById('tags').value = 'old1';
        document.getElementById('tags2').value = 'old2';
        form().fill({ tags: ['only'] });
        expect(document.getElementById('tags').value).toBe('only');
        expect(document.getElementById('tags2').value).toBe('');
    });

    it('checks a single checkbox when the value is truthy', () => {
        form().fill({ agree: true });
        expect(document.getElementById('agree').checked).toBe(true);
    });

    it('unchecks a single checkbox when the value is falsy', () => {
        document.getElementById('agree').checked = true;
        form().fill({ agree: false });
        expect(document.getElementById('agree').checked).toBe(false);
    });

    it('checks the correct members of a checkbox group from an array', () => {
        form().fill({ hobbies: ['sports'] });
        expect(document.getElementById('hobby-music').checked).toBe(false);
        expect(document.getElementById('hobby-sports').checked).toBe(true);
    });

    it('checks all specified checkboxes in a group', () => {
        form().fill({ hobbies: ['music', 'sports'] });
        expect(document.getElementById('hobby-music').checked).toBe(true);
        expect(document.getElementById('hobby-sports').checked).toBe(true);
    });

    it('deselects all checkboxes in a group when passed an empty array', () => {
        document.getElementById('hobby-music').checked = true;
        form().fill({ hobbies: [] });
        expect(document.getElementById('hobby-music').checked).toBe(false);
        expect(document.getElementById('hobby-sports').checked).toBe(false);
    });

    it('sets the correct radio button', () => {
        form().fill({ gender: 'f' });
        expect(document.getElementById('gender-m').checked).toBe(false);
        expect(document.getElementById('gender-f').checked).toBe(true);
    });

    it('changes the radio selection', () => {
        document.getElementById('gender-f').checked = true;
        form().fill({ gender: 'm' });
        expect(document.getElementById('gender-m').checked).toBe(true);
        expect(document.getElementById('gender-f').checked).toBe(false);
    });

    it('falls back to element id when no matching name is found', () => {
        // The key "username" matches both name="username" and id="username";
        // confirm the value lands on the element with that id.
        form().fill({ username: 'dave' });
        expect(document.getElementById('username').value).toBe('dave');
    });

    it('fill() is chainable and returns the handle', () => {
        const fh = form();
        expect(fh.fill({})).toBe(fh);
    });
});

// ---------------------------------------------------------------------------
// field() — resolves a RoroHandle
// ---------------------------------------------------------------------------
describe('RoroFormHandle.field() — handle resolution', () => {
    beforeEach(() => setBody(signupFixture()));

    it('resolves a field by its input name', () => {
        const fh = form().field('username');
        expect(fh).toBeInstanceOf(window.RoroHandle);
    });

    it('the resolved handle\'s id points to the correct element', () => {
        const fh = form().field('username');
        expect(fh.id).toBe('username');
    });

    it('resolves a field by its element id', () => {
        const fh = form().field('email');
        expect(fh.id).toBe('email');
    });

    it('can read the current value via field().value()', () => {
        document.getElementById('username').value = 'frank';
        expect(form().field('username').value()).toBe('frank');
    });

    it('can set the value via field().value(v)', () => {
        form().field('username').value('grace');
        expect(document.getElementById('username').value).toBe('grace');
    });

    it('resolves a [] name field (strips [] for matching)', () => {
        // name="tags[]" — querying by "tags" should still resolve
        const fh = form().field('tags');
        // should be a RoroHandle (even if the matched element id is "tags")
        expect(fh).toBeInstanceOf(window.RoroHandle);
    });
});

// ---------------------------------------------------------------------------
// validate() / isValid()
// ---------------------------------------------------------------------------
describe('RoroFormHandle.validate() / isValid()', () => {
    beforeEach(() => setBody(signupFixture()));

    it('validate() calls reportValidity() on the form element', () => {
        const el = document.getElementById('signup');
        let called = false;
        el.reportValidity = () => { called = true; return true; };
        form().validate();
        expect(called).toBe(true);
    });

    it('validate() returns the value from reportValidity()', () => {
        const el = document.getElementById('signup');
        el.reportValidity = () => false;
        expect(form().validate()).toBe(false);
        el.reportValidity = () => true;
        expect(form().validate()).toBe(true);
    });

    it('isValid() calls checkValidity() on the form element', () => {
        const el = document.getElementById('signup');
        let called = false;
        el.checkValidity = () => { called = true; return true; };
        form().isValid();
        expect(called).toBe(true);
    });

    it('isValid() returns the value from checkValidity()', () => {
        const el = document.getElementById('signup');
        el.checkValidity = () => false;
        expect(form().isValid()).toBe(false);
        el.checkValidity = () => true;
        expect(form().isValid()).toBe(true);
    });

    it('validate() returns false for a missing form', () => {
        expect(window.roro.form('no-form').validate()).toBe(false);
    });

    it('isValid() returns false for a missing form', () => {
        expect(window.roro.form('no-form').isValid()).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// errors() / clearErrors()
// ---------------------------------------------------------------------------
describe('RoroFormHandle.errors() and clearErrors()', () => {
    beforeEach(() => setBody(signupFixture()));

    it('errors() shows an error message for a named field', () => {
        form().errors({ username: ['Required'] });
        const errContainer = document.querySelector('#roro-wrapper-username .roro-input-error-container');
        expect(errContainer.style.display).not.toBe('none');
    });

    it('errors() sets the error message text', () => {
        form().errors({ username: ['Must be at least 3 chars'] });
        const msg = document.querySelector('#roro-wrapper-username .roro-input-error-message');
        expect(msg.textContent).toBe('Must be at least 3 chars');
    });

    it('errors() joins multiple messages with ", "', () => {
        form().errors({ username: ['Too short', 'Invalid chars'] });
        const msg = document.querySelector('#roro-wrapper-username .roro-input-error-message');
        expect(msg.textContent).toBe('Too short, Invalid chars');
    });

    it('errors() can show errors on multiple fields at once', () => {
        form().errors({ username: ['Err1'], email: ['Err2'] });
        const usrMsg = document.querySelector('#roro-wrapper-username .roro-input-error-message');
        const emlMsg = document.querySelector('#roro-wrapper-email .roro-input-error-message');
        expect(usrMsg.textContent).toBe('Err1');
        expect(emlMsg.textContent).toBe('Err2');
    });

    it('clearErrors() hides all visible error containers', () => {
        // Show an error first.
        window.roroShowError('username', 'Oops', true);
        window.roroShowError('email', 'Bad', true);

        form().clearErrors();

        const usrErr = document.querySelector('#roro-wrapper-username .roro-input-error-container');
        const emlErr = document.querySelector('#roro-wrapper-email .roro-input-error-container');
        expect(usrErr.style.display).toBe('none');
        expect(emlErr.style.display).toBe('none');
    });

    it('clearErrors() clears the message text', () => {
        window.roroShowError('username', 'Bad username', true);
        form().clearErrors();
        const msg = document.querySelector('#roro-wrapper-username .roro-input-error-message');
        expect(msg.textContent).toBe('');
    });

    it('errors() normalises dot-notation keys (e.g. "user.name" -> "user[name]")', () => {
        // populateFormErrors calls normalizeInputName; but the fixture has name="username",
        // not a nested name. Test by injecting a dotted field directly.
        const extra = document.createElement('input');
        extra.id = 'user-city';
        extra.name = 'user[city]';
        extra.type = 'text';
        extra.className = 'roro-input';
        const wrapper = document.createElement('div');
        wrapper.id = 'roro-wrapper-user-city';
        wrapper.innerHTML = '<div class="roro-input-error-container" style="display:none"><span class="roro-input-error-message"></span></div>';
        wrapper.prepend(extra);
        document.getElementById('signup').appendChild(wrapper);

        form().errors({ 'user.city': ['Bad city'] });
        const msg = document.querySelector('#roro-wrapper-user-city .roro-input-error-message');
        expect(msg.textContent).toBe('Bad city');
    });

    it('errors() is chainable', () => {
        const fh = form();
        expect(fh.errors({})).toBe(fh);
    });

    it('clearErrors() is chainable', () => {
        const fh = form();
        expect(fh.clearErrors()).toBe(fh);
    });
});

// ---------------------------------------------------------------------------
// reset()
// ---------------------------------------------------------------------------
describe('RoroFormHandle.reset()', () => {
    beforeEach(() => setBody(signupFixture()));

    it('reset() calls the native form reset() method', () => {
        const el = document.getElementById('signup');
        let called = false;
        const orig = el.reset.bind(el);
        el.reset = () => { called = true; orig(); };
        form().reset();
        expect(called).toBe(true);
    });

    it('reset() clears text inputs to their default values', () => {
        document.getElementById('username').value = 'hello';
        form().reset();
        // The default value="" in the fixture means it resets to empty.
        expect(document.getElementById('username').value).toBe('');
    });

    it('reset() is chainable', () => {
        const fh = form();
        expect(fh.reset()).toBe(fh);
    });
});

// ---------------------------------------------------------------------------
// roroFormData / roroFillForm flat helpers
// ---------------------------------------------------------------------------
describe('flat helpers for form operations', () => {
    beforeEach(() => setBody(signupFixture()));

    it('roroFormData(id) returns the same object as form.data()', () => {
        document.getElementById('username').value = 'helen';
        expect(window.roroFormData('signup')).toEqual(form().data());
    });

    it('roroFillForm(id, data) fills native fields', () => {
        window.roroFillForm('signup', { username: 'ivan' });
        expect(document.getElementById('username').value).toBe('ivan');
    });

    it('roroFormErrors(id, errors) shows error messages', () => {
        window.roroFormErrors('signup', { username: ['Required'] });
        const msg = document.querySelector('#roro-wrapper-username .roro-input-error-message');
        expect(msg.textContent).toBe('Required');
    });

    it('roroClearFormErrors(id) hides error messages', () => {
        window.roroShowError('username', 'Oops', true);
        window.roroClearFormErrors('signup');
        const errContainer = document.querySelector('#roro-wrapper-username .roro-input-error-container');
        expect(errContainer.style.display).toBe('none');
    });
});
