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
     class="roro-wrapper roro-wrapper-repeatable w-100 {{$wrapperClass}} @if($hasTopMargins) mt-4 @endif">

    @if($label)
        <label id="label-{{$id}}" class="roro-label roro-label-repeatable form-label {{$labelClass}}">
            {{ $label }}
            @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif

    {{-- One bordered panel around every row + the footer: reads as a single input. --}}
    <div class="roro-repeatable-panel border rounded bg-body overflow-hidden">
        <div class="roro-repeatable-empty px-3 py-4 text-center small text-muted" style="display:none;">
            {{ $placeholder ?: 'No items yet — add one below.' }}
        </div>

        <div class="roro-repeatable-rows"></div>

        <div class="roro-repeatable-footer border-top bg-body-tertiary px-3 py-2">
            <button type="button"
                    class="roro-repeatable-add btn btn-sm btn-link text-decoration-none fw-semibold p-1 {{$class}}">
                {!! $addLabel !!}
            </button>
        </div>
    </div>

    <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>

    {{-- Inert blueprint: the nested fields, cloned once per row by the JS. --}}
    <template class="roro-repeatable-template">{{ $slot }}</template>

    {{-- Inert row chrome: cloned per row, the blueprint is injected into .roro-repeatable-row-content. --}}
    <template class="roro-repeatable-row-template">
        <div class="roro-repeatable-row d-flex align-items-start gap-2 px-3 py-3 {{$rowClass}}">
            @if($reorderDrag)
                <span class="roro-repeatable-handle d-flex align-items-center justify-content-center flex-shrink-0 text-secondary pt-1" style="width:1.25rem;" aria-label="Drag to reorder" title="Drag to reorder">⠿</span>
            @endif
            <div class="roro-repeatable-row-body flex-grow-1" style="min-width:0;">
                @if($itemLabel)
                    <p class="roro-repeatable-row-label mb-2 small fw-semibold text-uppercase text-muted"></p>
                @endif
                <div class="roro-repeatable-row-content"></div>
            </div>
            <div class="roro-repeatable-row-controls d-flex align-items-center gap-1 flex-shrink-0 pt-1">
                @if($reorderButtons)
                    <button type="button" aria-label="Move up"
                            class="roro-repeatable-up btn btn-sm btn-link text-secondary p-1 lh-1">▲</button>
                    <button type="button" aria-label="Move down"
                            class="roro-repeatable-down btn btn-sm btn-link text-secondary p-1 lh-1">▼</button>
                @endif
                <button type="button" aria-label="Remove"
                        class="roro-repeatable-remove btn btn-sm btn-link text-secondary p-1 lh-1">{!! $removeLabel ?: '✕' !!}</button>
            </div>
        </div>
    </template>
</div>
