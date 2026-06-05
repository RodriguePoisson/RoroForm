<?php

/**
 * Tests for the numeric / date / misc input components:
 * number, range, date, time, datetime-local, month, week, color, hidden.
 *
 * Every assertion is grounded in the real Blade views under
 * resources/views/components/tailwind/inputs/ and the PHP classes under
 * src/View/Components/Inputs/.
 */

// ---------------------------------------------------------------------------
// number
// ---------------------------------------------------------------------------

describe('number input', function () {
    it('renders type=number with the roro-input-number class', function () {
        $html = $this->render(
            '<x-roro-number name="qty" id="qty"/>'
        );

        expect($html)
            ->toContain('type="number"')
            ->toContain('name="qty"')
            ->toContain('id="qty"')
            ->toContain('roro-input roro-input-number')
            ->toContain('roro-wrapper roro-wrapper-number');
    });

    it('passes a value through to the input', function () {
        $html = $this->render(
            '<x-roro-number name="qty" id="qty" value="42"/>'
        );

        expect($html)->toContain('value="42"');
    });

    it('renders min, max, and step attributes', function () {
        $html = $this->render(
            '<x-roro-number name="qty" id="qty" min="5" max="50" step="5"/>'
        );

        expect($html)
            ->toContain('min="5"')
            ->toContain('max="50"')
            ->toContain('step="5"');
    });

    it('omits min, max and step when none are supplied', function () {
        // min/max/step default to null and are only emitted when provided,
        // so a bare number input imposes no constraints.
        $html = $this->render('<x-roro-number name="qty" id="qty"/>');

        expect($html)
            ->not->toContain('min=')
            ->not->toContain('max=')
            ->not->toContain('step=');
    });

    it('renders the label when provided', function () {
        $html = $this->render(
            '<x-roro-number name="qty" id="qty" label="Quantity"/>'
        );

        expect($html)
            ->toContain('id="label-qty"')
            ->toContain('for="qty"')
            ->toContain('Quantity');
    });

    it('renders the list attribute when set', function () {
        $html = $this->render(
            '<x-roro-number name="qty" id="qty" list="qty-options"/>'
        );

        expect($html)->toContain('list="qty-options"');
    });

    it('does not render the list attribute when not set', function () {
        $html = $this->render('<x-roro-number name="qty" id="qty"/>');

        expect($html)->not->toContain('list=');
    });

    it('emits required when defaultJsValidation is on and :required=true', function () {
        $html = $this->defaultJsValidation(true)->render(
            '<x-roro-number name="qty" id="qty" :required="true"/>'
        );

        expect($html)->toContain('required');
    });

    it('omits required when defaultJsValidation is off', function () {
        $html = $this->defaultJsValidation(false)->render(
            '<x-roro-number name="qty" id="qty" :required="true"/>'
        );

        // The blade outputs '' when the condition is false — no "required" token.
        expect($html)->not->toContain('required');
    });

    it('repopulates value from old input', function () {
        $html = $this->withOld(['qty' => '99'])->render(
            '<x-roro-number name="qty" id="qty"/>'
        );

        expect($html)->toContain('value="99"');
    });

    it('shows an error when session errors are present', function () {
        $html = $this->withErrors(['qty' => ['Must be positive.']])->render(
            '<x-roro-number name="qty" id="qty"/>'
        );

        expect($html)->toContain('Must be positive.');
    });
});

// ---------------------------------------------------------------------------
// range
// ---------------------------------------------------------------------------

describe('range input', function () {
    it('renders type=range with the roro-input-range class', function () {
        $html = $this->render('<x-roro-range name="sat" id="sat"/>');

        expect($html)
            ->toContain('type="range"')
            ->toContain('name="sat"')
            ->toContain('id="sat"')
            ->toContain('roro-input roro-input-range')
            ->toContain('roro-wrapper roro-wrapper-range');
    });

    it('passes value through to the input', function () {
        $html = $this->render('<x-roro-range name="sat" id="sat" value="75"/>');

        expect($html)->toContain('value="75"');
    });

    it('renders min, max, and step attributes', function () {
        $html = $this->render(
            '<x-roro-range name="sat" id="sat" min="0" max="100" step="5"/>'
        );

        expect($html)
            ->toContain('min="0"')
            ->toContain('max="100"')
            ->toContain('step="5"');
    });

    it('renders the list attribute when set', function () {
        $html = $this->render(
            '<x-roro-range name="sat" id="sat" list="sat-ticks"/>'
        );

        expect($html)->toContain('list="sat-ticks"');
    });

    it('does not render the list attribute when not set', function () {
        $html = $this->render('<x-roro-range name="sat" id="sat"/>');

        expect($html)->not->toContain('list=');
    });

    it('also displays the current value as a text span next to the slider', function () {
        $html = $this->render('<x-roro-range name="sat" id="sat" value="60"/>');

        // The blade renders a <span> echoing $value next to the input.
        expect($html)->toContain('<span');
        expect($html)->toContain('60');
    });

    it('includes the oninput handler for live value display', function () {
        $html = $this->render('<x-roro-range name="sat" id="sat"/>');

        expect($html)->toContain('oninput=');
    });
});

// ---------------------------------------------------------------------------
// date
// ---------------------------------------------------------------------------

describe('date input', function () {
    it('renders type=date with the roro-input-date class', function () {
        $html = $this->render('<x-roro-date name="dob" id="dob"/>');

        expect($html)
            ->toContain('type="date"')
            ->toContain('name="dob"')
            ->toContain('id="dob"')
            ->toContain('roro-input roro-input-date')
            ->toContain('roro-wrapper roro-wrapper-date');
    });

    it('passes value through to the input', function () {
        $html = $this->render('<x-roro-date name="dob" id="dob" value="2025-01-15"/>');

        expect($html)->toContain('value="2025-01-15"');
    });

    it('renders min and max when supplied', function () {
        $html = $this->render(
            '<x-roro-date name="dob" id="dob" min="2000-01-01" max="2030-12-31"/>'
        );

        expect($html)
            ->toContain('min="2000-01-01"')
            ->toContain('max="2030-12-31"');
    });

    it('omits min and max when not supplied (null)', function () {
        // min/max default to null, and the blade guards with @if(!is_null()),
        // so no empty min=""/max="" attributes are emitted.
        $html = $this->render('<x-roro-date name="dob" id="dob"/>');

        expect($html)
            ->not->toContain('min=')
            ->not->toContain('max=');
    });

    it('renders the label when provided', function () {
        $html = $this->render('<x-roro-date name="dob" id="dob" label="Date of Birth"/>');

        expect($html)
            ->toContain('id="label-dob"')
            ->toContain('for="dob"')
            ->toContain('Date of Birth');
    });

    it('repopulates value from old input', function () {
        $html = $this->withOld(['dob' => '1990-06-15'])->render(
            '<x-roro-date name="dob" id="dob"/>'
        );

        expect($html)->toContain('value="1990-06-15"');
    });

    it('shows validation error when present', function () {
        $html = $this->withErrors(['dob' => ['Invalid date.']])->render(
            '<x-roro-date name="dob" id="dob"/>'
        );

        expect($html)->toContain('Invalid date.');
    });
});

// ---------------------------------------------------------------------------
// time
// ---------------------------------------------------------------------------

describe('time input', function () {
    it('renders type=time with the roro-input-time class', function () {
        $html = $this->render('<x-roro-time name="t" id="t"/>');

        expect($html)
            ->toContain('type="time"')
            ->toContain('name="t"')
            ->toContain('id="t"')
            ->toContain('roro-input roro-input-time')
            ->toContain('roro-wrapper roro-wrapper-time');
    });

    it('passes value through', function () {
        $html = $this->render('<x-roro-time name="t" id="t" value="09:30"/>');

        expect($html)->toContain('value="09:30"');
    });

    it('renders min and max when supplied', function () {
        $html = $this->render(
            '<x-roro-time name="t" id="t" min="08:00" max="18:00"/>'
        );

        expect($html)
            ->toContain('min="08:00"')
            ->toContain('max="18:00"');
    });

    it('renders the label when provided', function () {
        $html = $this->render('<x-roro-time name="t" id="t" label="Start Time"/>');

        expect($html)
            ->toContain('id="label-t"')
            ->toContain('Start Time');
    });
});

// ---------------------------------------------------------------------------
// datetime-local
// ---------------------------------------------------------------------------

describe('datetime-local input', function () {
    it('renders type=datetime-local with the roro-input-datetime-local class', function () {
        $html = $this->render('<x-roro-datetime-local name="dt" id="dt"/>');

        expect($html)
            ->toContain('type="datetime-local"')
            ->toContain('name="dt"')
            ->toContain('id="dt"')
            ->toContain('roro-input roro-input-datetime-local')
            ->toContain('roro-wrapper roro-wrapper-datetime-local');
    });

    it('passes value through', function () {
        $html = $this->render(
            '<x-roro-datetime-local name="dt" id="dt" value="2025-06-01T10:00"/>'
        );

        expect($html)->toContain('value="2025-06-01T10:00"');
    });

    it('renders min and max when supplied', function () {
        $html = $this->render(
            '<x-roro-datetime-local name="dt" id="dt" min="2025-01-01T00:00" max="2025-12-31T23:59"/>'
        );

        expect($html)
            ->toContain('min="2025-01-01T00:00"')
            ->toContain('max="2025-12-31T23:59"');
    });

    it('renders the label when provided', function () {
        $html = $this->render(
            '<x-roro-datetime-local name="dt" id="dt" label="Appointment"/>'
        );

        expect($html)
            ->toContain('id="label-dt"')
            ->toContain('Appointment');
    });
});

// ---------------------------------------------------------------------------
// month
// ---------------------------------------------------------------------------

describe('month input', function () {
    it('renders type=month with the roro-input-month class', function () {
        $html = $this->render('<x-roro-month name="m" id="m"/>');

        expect($html)
            ->toContain('type="month"')
            ->toContain('name="m"')
            ->toContain('id="m"')
            ->toContain('roro-input roro-input-month')
            ->toContain('roro-wrapper roro-wrapper-month');
    });

    it('passes value through', function () {
        $html = $this->render('<x-roro-month name="m" id="m" value="2025-06"/>');

        expect($html)->toContain('value="2025-06"');
    });

    it('renders min and max when supplied', function () {
        $html = $this->render(
            '<x-roro-month name="m" id="m" min="2024-01" max="2025-12"/>'
        );

        expect($html)
            ->toContain('min="2024-01"')
            ->toContain('max="2025-12"');
    });

    it('renders the label when provided', function () {
        $html = $this->render('<x-roro-month name="m" id="m" label="Select Month"/>');

        expect($html)
            ->toContain('id="label-m"')
            ->toContain('Select Month');
    });

    it('repopulates value from old input', function () {
        $html = $this->withOld(['m' => '2024-03'])->render(
            '<x-roro-month name="m" id="m"/>'
        );

        expect($html)->toContain('value="2024-03"');
    });
});

// ---------------------------------------------------------------------------
// week
// ---------------------------------------------------------------------------

describe('week input', function () {
    it('renders type=week with the roro-input-week class', function () {
        $html = $this->render('<x-roro-week name="w" id="w"/>');

        expect($html)
            ->toContain('type="week"')
            ->toContain('name="w"')
            ->toContain('id="w"')
            ->toContain('roro-input roro-input-week')
            ->toContain('roro-wrapper roro-wrapper-week');
    });

    it('passes value through', function () {
        $html = $this->render('<x-roro-week name="w" id="w" value="2025-W23"/>');

        expect($html)->toContain('value="2025-W23"');
    });

    it('renders min and max when supplied', function () {
        $html = $this->render(
            '<x-roro-week name="w" id="w" min="2025-W01" max="2025-W52"/>'
        );

        expect($html)
            ->toContain('min="2025-W01"')
            ->toContain('max="2025-W52"');
    });

    it('renders the label when provided', function () {
        $html = $this->render('<x-roro-week name="w" id="w" label="Select Week"/>');

        expect($html)
            ->toContain('id="label-w"')
            ->toContain('Select Week');
    });
});

// ---------------------------------------------------------------------------
// color
// ---------------------------------------------------------------------------

describe('color input', function () {
    it('renders type=color with the roro-input-color class', function () {
        $html = $this->render('<x-roro-color name="c" id="c"/>');

        expect($html)
            ->toContain('type="color"')
            ->toContain('name="c"')
            ->toContain('id="c"')
            ->toContain('roro-input roro-input-color')
            ->toContain('roro-wrapper roro-wrapper-color');
    });

    it('passes value through to the color input', function () {
        $html = $this->render('<x-roro-color name="c" id="c" value="#ff0000"/>');

        expect($html)->toContain('value="#ff0000"');
    });

    it('also reflects value in the swatch label background-color style', function () {
        $html = $this->render('<x-roro-color name="c" id="c" value="#ff0000"/>');

        expect($html)->toContain('background-color: #ff0000');
    });

    it('renders the label text when provided', function () {
        $html = $this->render('<x-roro-color name="c" id="c" label="Pick a colour"/>');

        expect($html)->toContain('Pick a colour');
    });

    it('renders the companion text input by default (hideTextInput=false)', function () {
        $html = $this->render('<x-roro-color name="c" id="c" value="#123456"/>');

        // The text input must be present and NOT have display:none
        // (style attribute omitted when $hideTextInput is false).
        expect($html)->toContain('type="text"');
        // No inline display:none on the text input.
        expect($html)->not->toContain('display:none');
    });

    it('hides the companion text input when :hide-text-input="true"', function () {
        $html = $this->render(
            '<x-roro-color name="c" id="c" :hide-text-input="true"/>'
        );

        // The blade adds style="display:none;" on the text input only.
        expect($html)->toContain('type="text"');
        expect($html)->toContain('display:none');
    });

    it('includes the onchange handler that syncs swatch and text input', function () {
        $html = $this->render('<x-roro-color name="c" id="c"/>');

        expect($html)->toContain('onchange=');
    });

    it('emits required when defaultJsValidation is on and :required=true', function () {
        $html = $this->defaultJsValidation(true)->render(
            '<x-roro-color name="c" id="c" :required="true"/>'
        );

        expect($html)->toContain('required');
    });

    it('omits required when defaultJsValidation is off', function () {
        $html = $this->defaultJsValidation(false)->render(
            '<x-roro-color name="c" id="c" :required="true"/>'
        );

        expect($html)->not->toContain('required');
    });

    it('shows validation error when present', function () {
        $html = $this->withErrors(['c' => ['Color is required.']])->render(
            '<x-roro-color name="c" id="c"/>'
        );

        expect($html)->toContain('Color is required.');
    });
});

// ---------------------------------------------------------------------------
// hidden
// ---------------------------------------------------------------------------

describe('hidden input', function () {
    it('renders type=hidden with the roro-input-hidden class', function () {
        $html = $this->render('<x-roro-hidden name="token" id="token"/>');

        expect($html)
            ->toContain('type="hidden"')
            ->toContain('name="token"')
            ->toContain('id="token"')
            ->toContain('roro-input roro-input-hidden');
    });

    it('passes value through to the hidden input', function () {
        $html = $this->render('<x-roro-hidden name="token" id="token" value="abc123"/>');

        expect($html)->toContain('value="abc123"');
    });

    it('does NOT render a div wrapper', function () {
        $html = $this->render('<x-roro-hidden name="token" id="token"/>');

        expect($html)
            ->not->toContain('roro-wrapper')
            ->not->toContain('<div');
    });

    it('does NOT render a label element', function () {
        $html = $this->render('<x-roro-hidden name="token" id="token"/>');

        expect($html)->not->toContain('<label');
    });

    it('does NOT render an error section', function () {
        $html = $this->withErrors(['token' => ['Bad token.']])->render(
            '<x-roro-hidden name="token" id="token"/>'
        );

        // The hidden blade is a bare <input>; no error slot is rendered.
        expect($html)->not->toContain('Bad token.');
    });

    it('is a single self-closing input element with no surrounding markup', function () {
        $html = trim($this->render('<x-roro-hidden name="h" id="h" value="x"/>'));

        // The blade view outputs only the <input ...> tag.
        expect($html)->toStartWith('<input');
        expect($html)->toContain('type="hidden"');
    });

    it('repopulates value from old input', function () {
        $html = $this->withOld(['token' => 'old-token'])->render(
            '<x-roro-hidden name="token" id="token"/>'
        );

        expect($html)->toContain('value="old-token"');
    });
});
