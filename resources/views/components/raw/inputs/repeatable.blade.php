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
     class="roro-wrapper roro-wrapper-repeatable {{$wrapperClass}} @if($hasTopMargins) roro-mt @endif">

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="roro-label roro-label-repeatable {{$labelClass}}">
            {{ $label }}
            @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif

    {{-- One bordered panel around every row + the footer: reads as a single input. --}}
    <div class="roro-repeatable-panel">
        <div class="roro-repeatable-empty" style="display:none;">
            {{ $placeholder ?: 'No items yet — add one below.' }}
        </div>

        <div class="roro-repeatable-rows"></div>

        <div class="roro-repeatable-footer">
            <button type="button"
                    class="roro-repeatable-add {{$class}}">
                {!! $addLabel !!}
            </button>
        </div>
    </div>

    <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>

    {{-- Inert blueprint: the nested fields, cloned once per row by the JS. --}}
    <template class="roro-repeatable-template">{{ $slot }}</template>

    {{-- Inert row chrome: cloned per row, the blueprint is injected into .roro-repeatable-row-content. --}}
    <template class="roro-repeatable-row-template">
        <div class="roro-repeatable-row {{$rowClass}}">
            @if($reorderDrag)
                <span class="roro-repeatable-handle" aria-label="Drag to reorder" title="Drag to reorder">⠿</span>
            @endif
            <div class="roro-repeatable-row-body">
                @if($itemLabel)
                    <p class="roro-repeatable-row-label"></p>
                @endif
                <div class="roro-repeatable-row-content"></div>
            </div>
            <div class="roro-repeatable-controls">
                @if($reorderButtons)
                    <button type="button" aria-label="Move up"
                            class="roro-repeatable-up">▲</button>
                    <button type="button" aria-label="Move down"
                            class="roro-repeatable-down">▼</button>
                @endif
                <button type="button" aria-label="Remove"
                        class="roro-repeatable-remove">{!! $removeLabel ?: '✕' !!}</button>
            </div>
        </div>
    </template>
</div>
