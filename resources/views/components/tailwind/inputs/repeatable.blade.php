<x-roro-repeatable-helper></x-roro-repeatable-helper>
@php
    $reorderButtons = $reorder === true || $reorder === 'buttons' || $reorder === 'both';
    $reorderDrag = $reorder === 'drag' || $reorder === 'both';
@endphp
<div id="roro-wrapper-{{$id}}"
     data-id="{{$id}}"
     data-name="{{$name}}"
     data-min="{{$min}}"
     data-max="{{$max}}"
     data-index-token="{{$indexToken}}"
     data-indexed="{{ $indexed ? '1' : '0' }}"
     @if($keyField) data-key-field="{{$keyField}}" @endif
     data-item-label="{{$itemLabel}}"
     @if($reorderButtons || $reorderDrag) data-reorder="1" @endif
     @if($reorderDrag) data-reorder-drag="1" @endif
     data-rows="{{ json_encode($rows) }}"
     style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-repeatable w-full {{$wrapperClass}} @if($hasTopMargins) mt-6 @endif">

    @if($label)
        <label id="label-{{$id}}" class="roro-label roro-label-repeatable block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 {{$labelClass}}">
            {{ $label }}
            @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif

    {{-- One bordered panel around every row + the footer: reads as a single input. --}}
    <div class="roro-repeatable-panel overflow-hidden rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
        <div class="roro-repeatable-empty px-4 py-6 text-center text-sm text-zinc-400 dark:text-zinc-500" style="display:none;">
            {{ $placeholder ?: 'No items yet — add one below.' }}
        </div>

        <div class="roro-repeatable-rows"></div>

        <div class="roro-repeatable-footer border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
            <button type="button"
                    class="roro-repeatable-add inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 transition hover:bg-indigo-50 dark:hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50 {{$class}}">
                {!! $addLabel !!}
            </button>
        </div>
    </div>

    <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>

    {{-- Inert blueprint: the nested fields, cloned once per row by the JS. --}}
    <template class="roro-repeatable-template">{{ $slot }}</template>

    {{-- Inert row chrome: cloned per row, the blueprint is injected into .roro-repeatable-row-content. --}}
    <template class="roro-repeatable-row-template">
        <div class="roro-repeatable-row group flex items-start gap-3 px-4 py-3.5 transition hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 {{$rowClass}}">
            @if($reorderDrag)
                <span class="roro-repeatable-handle flex h-7 w-5 shrink-0 items-center justify-center pt-0.5 text-zinc-300 dark:text-zinc-600 transition hover:text-zinc-500 dark:hover:text-zinc-400" aria-label="Drag to reorder" title="Drag to reorder">⠿</span>
            @endif
            <div class="roro-repeatable-row-body min-w-0 flex-1">
                @if($itemLabel)
                    <p class="roro-repeatable-row-label mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500"></p>
                @endif
                <div class="roro-repeatable-row-content"></div>
            </div>
            <div class="roro-repeatable-row-controls flex shrink-0 items-center gap-1 pt-0.5">
                @if($reorderButtons)
                    <button type="button" aria-label="Move up"
                            class="roro-repeatable-up flex h-7 w-7 items-center justify-center rounded-md text-xs text-zinc-400 dark:text-zinc-500 transition hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30">▲</button>
                    <button type="button" aria-label="Move down"
                            class="roro-repeatable-down flex h-7 w-7 items-center justify-center rounded-md text-xs text-zinc-400 dark:text-zinc-500 transition hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30">▼</button>
                @endif
                <button type="button" aria-label="Remove"
                        class="roro-repeatable-remove flex h-7 w-7 items-center justify-center rounded-md text-sm text-zinc-400 dark:text-zinc-500 transition hover:bg-red-100 dark:hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30">{!! $removeLabel ?: '✕' !!}</button>
            </div>
        </div>
    </template>
</div>
