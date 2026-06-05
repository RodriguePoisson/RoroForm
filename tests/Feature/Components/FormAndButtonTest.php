<?php

// ──────────────────────────────────────────────
// Form component tests
// ──────────────────────────────────────────────

describe('Form – method attribute', function () {
    it('uppercases the method attribute', function () {
        $html = $this->render('<x-roro-form id="f1" method="post" action="/x"></x-roro-form>');

        expect($html)->toContain('method="POST"');
    });

    it('emits the supplied GET method uppercased', function () {
        $html = $this->render('<x-roro-form id="f2" method="get" action="/x"></x-roro-form>');

        expect($html)->toContain('method="GET"');
    });

    it('defaults to POST when no method is provided', function () {
        $html = $this->render('<x-roro-form id="f3" action="/x"></x-roro-form>');

        expect($html)->toContain('method="POST"');
    });
});

describe('Form – CSRF hidden token', function () {
    it('includes the hidden _token field for POST', function () {
        $html = $this->render('<x-roro-form id="f4" method="POST" action="/x"></x-roro-form>');

        // @csrf renders a hidden input with name="_token"
        expect($html)->toContain('name="_token"');
    });

    it('includes the hidden _token field for PUT', function () {
        $html = $this->render('<x-roro-form id="f5" method="PUT" action="/x"></x-roro-form>');

        expect($html)->toContain('name="_token"');
    });

    it('includes the hidden _token field for PATCH', function () {
        $html = $this->render('<x-roro-form id="f6" method="PATCH" action="/x"></x-roro-form>');

        expect($html)->toContain('name="_token"');
    });

    it('includes the hidden _token field for DELETE', function () {
        $html = $this->render('<x-roro-form id="f7" method="DELETE" action="/x"></x-roro-form>');

        expect($html)->toContain('name="_token"');
    });

    it('omits the hidden _token field for GET', function () {
        $html = $this->render('<x-roro-form id="f8" method="GET" action="/x"></x-roro-form>');

        expect($html)->not->toContain('name="_token"');
    });
});

describe('Form – multipart / enctype', function () {
    it('renders enctype="multipart/form-data" when :multipart="true"', function () {
        $html = $this->render('<x-roro-form id="f9" :multipart="true" action="/x"></x-roro-form>');

        expect($html)->toContain('enctype="multipart/form-data"');
    });

    it('omits enctype when multipart is false (the default)', function () {
        $html = $this->render('<x-roro-form id="f10" action="/x"></x-roro-form>');

        expect($html)->not->toContain('enctype=');
    });

    it('renders the explicit enctype when enctype is supplied', function () {
        $html = $this->render(
            '<x-roro-form id="f11" enctype="application/x-www-form-urlencoded" action="/x"></x-roro-form>'
        );

        expect($html)->toContain('enctype="application/x-www-form-urlencoded"');
    });

    it('turns multipart off when an explicit enctype is also supplied', function () {
        // When both are given, the explicit enctype wins and multipart is set to false,
        // so "multipart/form-data" must not appear via the multipart branch.
        $html = $this->render(
            '<x-roro-form id="f12" :multipart="true" enctype="application/x-www-form-urlencoded" action="/x"></x-roro-form>'
        );

        expect($html)
            ->toContain('enctype="application/x-www-form-urlencoded"')
            ->not->toContain('enctype="multipart/form-data"');
    });
});

describe('Form – action attribute', function () {
    it('renders the action attribute with the supplied value', function () {
        $html = $this->render('<x-roro-form id="f13" action="/submit/here"></x-roro-form>');

        expect($html)->toContain('action="/submit/here"');
    });

    it('renders an empty action when none is provided', function () {
        $html = $this->render('<x-roro-form id="f14"></x-roro-form>');

        expect($html)->toContain('action=""');
    });
});

describe('Form – overlay', function () {
    it('renders the overlay div by default', function () {
        $html = $this->render('<x-roro-form id="f15" action="/x"></x-roro-form>');

        expect($html)->toContain('id="roro-form-overlay"');
    });

    it('omits the overlay div when :overlay="false"', function () {
        $html = $this->render('<x-roro-form id="f16" action="/x" :overlay="false"></x-roro-form>');

        expect($html)->not->toContain('id="roro-form-overlay"');
    });
});

describe('Form – JS runtime', function () {
    it('inlines the JS runtime containing window.roro', function () {
        $html = $this->render('<x-roro-form id="f17" action="/x"></x-roro-form>');

        expect($html)->toContain('window.roro');
    });

    it('inlines the JS runtime inside a <script> tag', function () {
        $html = $this->render('<x-roro-form id="f18" action="/x"></x-roro-form>');

        expect($html)->toContain('<script>');
    });
});

describe('Form – id attribute', function () {
    it('uses the supplied id on the form element', function () {
        $html = $this->render('<x-roro-form id="my-form" action="/x"></x-roro-form>');

        expect($html)->toContain('id="my-form"');
    });
});

// ──────────────────────────────────────────────
// Button component tests
// ──────────────────────────────────────────────

describe('Button – base markup', function () {
    it('renders with class roro-btn-submit for type submit', function () {
        $html = $this->render('<x-roro-button>Save</x-roro-button>');

        expect($html)->toContain('roro-btn-submit');
    });

    it('renders with type="submit" by default', function () {
        $html = $this->render('<x-roro-button>Save</x-roro-button>');

        expect($html)->toContain('type="submit"');
    });

    it('renders roro-btn class regardless of type', function () {
        $html = $this->render('<x-roro-button>Save</x-roro-button>');

        expect($html)->toContain('roro-btn');
    });

    it('does not render roro-btn-submit when type is button', function () {
        $html = $this->render('<x-roro-button type="button">Click</x-roro-button>');

        expect($html)
            ->toContain('type="button"')
            ->not->toContain('roro-btn-submit');
    });
});

describe('Button – slot label', function () {
    it('renders the slot content as the button label', function () {
        $html = $this->render('<x-roro-button>Submit Form</x-roro-button>');

        expect($html)->toContain('Submit Form');
    });

    it('renders arbitrary HTML in the slot', function () {
        $html = $this->render('<x-roro-button><span>Go</span></x-roro-button>');

        expect($html)->toContain('<span>Go</span>');
    });
});

describe('Button – data-ajax attribute', function () {
    it('renders data-ajax="1" when :ajax="true"', function () {
        $html = $this->render('<x-roro-button :ajax="true">Go</x-roro-button>');

        // PHP bool true renders as "1" in Blade string interpolation
        expect($html)->toContain('data-ajax="1"');
    });

    it('renders data-ajax="" (falsy) when ajax is false (default)', function () {
        $html = $this->render('<x-roro-button>Go</x-roro-button>');

        // PHP bool false renders as "" in Blade string interpolation
        expect($html)->toContain('data-ajax=""');
    });
});

describe('Button – data-form-id attribute', function () {
    it('renders data-form-id with the supplied form-id', function () {
        $html = $this->render('<x-roro-button form-id="my-form">Go</x-roro-button>');

        expect($html)->toContain('data-form-id="my-form"');
    });

    it('renders data-form-id="" when no form-id is supplied', function () {
        $html = $this->render('<x-roro-button>Go</x-roro-button>');

        expect($html)->toContain('data-form-id=""');
    });
});

describe('Button – data-ajax-errors attribute', function () {
    it('renders data-ajax-errors="1" when enableAjaxErrors is true (default)', function () {
        $html = $this->render('<x-roro-button>Go</x-roro-button>');

        // enableAjaxErrors defaults to true → renders as "1"
        expect($html)->toContain('data-ajax-errors="1"');
    });

    it('renders data-ajax-errors="" when :enable-ajax-errors="false"', function () {
        $html = $this->render('<x-roro-button :enable-ajax-errors="false">Go</x-roro-button>');

        expect($html)->toContain('data-ajax-errors=""');
    });
});

describe('Button – disabled attribute', function () {
    it('renders the disabled attribute when :disabled="true"', function () {
        $html = $this->render('<x-roro-button :disabled="true">Go</x-roro-button>');

        expect($html)->toContain('disabled');
    });

    it('omits the disabled attribute by default', function () {
        $html = $this->render('<x-roro-button>Go</x-roro-button>');

        // The button HTML should not contain a bare "disabled" attribute
        expect($html)->not->toContain(' disabled ');
    });
});

describe('Button – inside a form (integration)', function () {
    it('can be rendered inside a form with form-id wiring', function () {
        $html = $this->render(
            '<x-roro-form id="checkout" action="/checkout">' .
            '<x-roro-button :ajax="true" form-id="checkout">Pay</x-roro-button>' .
            '</x-roro-form>'
        );

        expect($html)
            ->toContain('id="checkout"')
            ->toContain('data-ajax="1"')
            ->toContain('data-form-id="checkout"')
            ->toContain('Pay');
    });
});
