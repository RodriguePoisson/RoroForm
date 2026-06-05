<?php

use RoroForm\View\Components\Form;
use RoroForm\View\Components\Inputs\Repeatable;
use RoroForm\View\Components\Inputs\Text;

// ---------------------------------------------------------------------------
// Form — method uppercasing and csrf flag
// ---------------------------------------------------------------------------

describe('Form::method', function () {
    it('uppercases a lowercase method string', function () {
        $form = new Form(method: 'post');
        expect($form->method)->toBe('POST');
    });

    it('uppercases a mixed-case method string', function () {
        $form = new Form(method: 'Put');
        expect($form->method)->toBe('PUT');
    });

    it('keeps an already-uppercase method unchanged', function () {
        $form = new Form(method: 'DELETE');
        expect($form->method)->toBe('DELETE');
    });

    it('defaults method to POST', function () {
        $form = new Form();
        expect($form->method)->toBe('POST');
    });
});

describe('Form::csrf', function () {
    it('is true for POST', function () {
        expect((new Form(method: 'POST'))->csrf)->toBeTrue();
    });

    it('is true for post (lowercase input)', function () {
        expect((new Form(method: 'post'))->csrf)->toBeTrue();
    });

    it('is true for PUT', function () {
        expect((new Form(method: 'PUT'))->csrf)->toBeTrue();
    });

    it('is true for PATCH', function () {
        expect((new Form(method: 'PATCH'))->csrf)->toBeTrue();
    });

    it('is true for DELETE', function () {
        expect((new Form(method: 'DELETE'))->csrf)->toBeTrue();
    });

    it('is false for GET', function () {
        expect((new Form(method: 'GET'))->csrf)->toBeFalse();
    });

    it('is false for get (lowercase input)', function () {
        expect((new Form(method: 'get'))->csrf)->toBeFalse();
    });
});

// ---------------------------------------------------------------------------
// Form — enctype vs multipart interaction
// ---------------------------------------------------------------------------

describe('Form::enctype / multipart', function () {
    it('keeps multipart true when no explicit enctype is given', function () {
        $form = new Form(multipart: true);
        expect($form->multipart)->toBeTrue();
        expect($form->enctype)->toBeNull();
    });

    it('sets multipart to false when an explicit enctype is supplied', function () {
        $form = new Form(multipart: true, enctype: 'multipart/form-data');
        expect($form->multipart)->toBeFalse();
    });

    it('stores the explicit enctype value unchanged', function () {
        $form = new Form(enctype: 'application/x-www-form-urlencoded');
        expect($form->enctype)->toBe('application/x-www-form-urlencoded');
        expect($form->multipart)->toBeFalse();
    });

    it('multipart defaults to false when no enctype or multipart is given', function () {
        $form = new Form();
        expect($form->multipart)->toBeFalse();
    });
});

// ---------------------------------------------------------------------------
// ComponentMain — invalid theme throws InvalidArgumentException
// ---------------------------------------------------------------------------

describe('ComponentMain invalid theme', function () {
    it('throws InvalidArgumentException for an unknown theme', function () {
        config()->set('roroform.theme', 'bogus');
        expect(fn () => new Text(name: 'x'))->toThrow(\InvalidArgumentException::class);
    });

    it('throws for an empty string theme', function () {
        config()->set('roroform.theme', '');
        expect(fn () => new Text(name: 'x'))->toThrow(\InvalidArgumentException::class);
    });

    it('does not throw for tailwind theme', function () {
        config()->set('roroform.theme', 'tailwind');
        expect(fn () => new Text(name: 'x'))->not->toThrow(\InvalidArgumentException::class);
    });

    it('does not throw for bootstrap theme', function () {
        config()->set('roroform.theme', 'bootstrap');
        expect(fn () => new Text(name: 'x'))->not->toThrow(\InvalidArgumentException::class);
    });

    it('does not throw for raw theme', function () {
        config()->set('roroform.theme', 'raw');
        expect(fn () => new Text(name: 'x'))->not->toThrow(\InvalidArgumentException::class);
    });
});

// ---------------------------------------------------------------------------
// InputMain::normalizeOldName — bracket-to-dot conversion
// ---------------------------------------------------------------------------

describe('InputMain::normalizeOldName', function () {
    // Expose the protected method via an anonymous subclass.
    $expose = function (string $name): string {
        $obj = new class (name: $name) extends Text {
            public function callNormalize(string $n): string
            {
                return $this->normalizeOldName($n);
            }
        };
        return $obj->callNormalize($name);
    };

    it('converts bracket notation to dot notation', function () use ($expose) {
        expect($expose('name[2][x]'))->toBe('name.2.x');
    });

    it('converts a single bracket segment', function () use ($expose) {
        expect($expose('items[0]'))->toBe('items.0');
    });

    it('handles deeply nested brackets', function () use ($expose) {
        expect($expose('a[b][c][d]'))->toBe('a.b.c.d');
    });

    it('trims a trailing dot that results from an empty bracket', function () use ($expose) {
        // name[] -> name. -> name (trailing dot trimmed)
        expect($expose('name[]'))->toBe('name');
    });

    it('leaves a plain name unchanged', function () use ($expose) {
        expect($expose('email'))->toBe('email');
    });

    it('leaves a dot-notation name unchanged', function () use ($expose) {
        expect($expose('user.profile.name'))->toBe('user.profile.name');
    });
});

// ---------------------------------------------------------------------------
// Repeatable::resolveRows — priority: old() > rows > populate
// ---------------------------------------------------------------------------

describe('Repeatable::resolveRows — rows vs populate priority', function () {
    it('uses rows when rows is non-empty and populate is empty', function () {
        $r = new Repeatable(
            name: 'items',
            rows: [['a' => 1], ['a' => 2]],
        );
        expect($r->rows)->toBe([['a' => 1], ['a' => 2]]);
    });

    it('uses populate when rows is empty and populate is non-empty', function () {
        $r = new Repeatable(
            name: 'items',
            populate: [['b' => 10], ['b' => 20]],
        );
        expect($r->rows)->toBe([['b' => 10], ['b' => 20]]);
    });

    it('rows beats populate when both are provided', function () {
        $r = new Repeatable(
            name: 'items',
            rows: [['src' => 'rows']],
            populate: [['src' => 'populate']],
        );
        expect($r->rows)->toBe([['src' => 'rows']]);
    });

    it('returns empty array when both rows and populate are empty', function () {
        $r = new Repeatable(name: 'items');
        expect($r->rows)->toBe([]);
    });

    it('re-indexes rows with array_values (non-sequential keys become 0-based)', function () {
        $r = new Repeatable(
            name: 'items',
            rows: [5 => ['val' => 'x'], 10 => ['val' => 'y']],
        );
        // resolveRows wraps with array_values, so keys must be 0 and 1
        expect(array_keys($r->rows))->toBe([0, 1]);
        expect($r->rows[0])->toBe(['val' => 'x']);
        expect($r->rows[1])->toBe(['val' => 'y']);
    });

    it('re-indexes populate with array_values (non-sequential keys become 0-based)', function () {
        $r = new Repeatable(
            name: 'items',
            populate: [3 => ['v' => 'a'], 7 => ['v' => 'b']],
        );
        expect(array_keys($r->rows))->toBe([0, 1]);
        expect($r->rows[0])->toBe(['v' => 'a']);
    });
});

describe('Repeatable::resolveRows — old() input wins', function () {
    it('prefers old() over explicit rows', function () {
        $this->withOld(['items' => [['a' => 'old_value']]]);

        $r = new Repeatable(
            name: 'items',
            rows: [['a' => 'explicit']],
        );

        expect($r->rows[0])->toBe(['a' => 'old_value']);
    });

    it('prefers old() over populate', function () {
        $this->withOld(['items' => [['x' => 'from_old']]]);

        $r = new Repeatable(
            name: 'items',
            populate: [['x' => 'from_populate']],
        );

        expect($r->rows[0])->toBe(['x' => 'from_old']);
    });

    it('re-indexes old() rows with array_values', function () {
        $this->withOld(['items' => [2 => ['k' => 'v']]]);

        $r = new Repeatable(name: 'items');

        expect(array_keys($r->rows))->toBe([0]);
        expect($r->rows[0])->toBe(['k' => 'v']);
    });

    it('falls back to rows when old() is empty array', function () {
        $this->withOld(['items' => []]);

        $r = new Repeatable(
            name: 'items',
            rows: [['a' => 'fallback']],
        );

        // empty old array is ignored per resolveRows condition ($old !== [])
        expect($r->rows[0])->toBe(['a' => 'fallback']);
    });

    it('falls back to rows when no name is given (old() skipped)', function () {
        $this->withOld(['items' => [['a' => 'should_be_ignored']]]);

        // name is empty, so old() is never fetched
        $r = new Repeatable(
            name: '',
            rows: [['a' => 'rows_value']],
        );

        expect($r->rows[0])->toBe(['a' => 'rows_value']);
    });
});
