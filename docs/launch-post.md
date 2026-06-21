# Launch post drafts

Lead with the differentiator (nested repeatable groups), include a GIF, stay in the
comments the first day. Before posting, upload `docs/demo.gif` directly into the post (Reddit/X handle GIFs natively) and swap `GIF_LINK` accordingly.

---

## Reddit — r/laravel (primary), then r/PHP

**Title**

> I built Laravel form components where nested repeatable groups *actually* work — searchable selects inside, clean array output, zero JS deps

**Body**

I kept rebuilding the same form plumbing on every Laravel project — repeatable rows,
searchable selects, wiring `old()` and validation errors back by hand — so I packaged it.

RoroForm gives you one Blade tag per field (25+ of them), and the headline feature is
repeatable groups that nest *anything* — including searchable selects, multi-selects and
file inputs — add/remove/reorder, and they submit as a clean `contacts[0][name]` array
with `old()` restored automatically after a failed validation. No extra wiring.

Other bits I'm happy with:

- A chainable, type-aware JS API: `roro('email').value('a@b.c').required()` — the same
  `.value()` works on a text input, a select, a checkbox, a file field…
- Zero JS dependencies (vanilla JS, drops into Livewire/Alpine/Inertia/plain Blade)
- Three themes including a framework-free one (no Tailwind/Bootstrap needed)
- Accessible custom selects (real ARIA combobox, keyboard-navigable)

GIF: GIF_LINK · Playground: https://playground.elcervo.com/ · GitHub: https://github.com/RodriguePoisson/RoroForm · `composer require roro/roroform`

It's free and Apache-licensed. Feedback very welcome — especially on the repeatable API,
since that's the part I obsessed over.

---

## X / Twitter

> Tired of rebuilding Laravel form plumbing? RoroForm: one Blade tag per field, nested
> repeatable groups that *actually* work (searchable selects & files inside → clean
> `contacts[0][name]` arrays, `old()` restored), a chainable JS API, zero JS deps.
>
> 👉 https://github.com/RodriguePoisson/RoroForm
> #Laravel #PHP
>
> [attach GIF]

---

## Laravel News — community submission

Use the community links form. One-line pitch:

> RoroForm — Laravel Blade form components with nested repeatable groups, searchable
> selects, a chainable type-aware JS API, and a framework-free theme. Zero JS dependencies.
