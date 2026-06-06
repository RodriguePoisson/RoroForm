@php
    // Native Bootstrap .form-check: display:block (not !important), so the
    // inline display:none from $hidden still works (unlike .d-flex).
    if (!$wrapperClass) {
        $wrapperClass = 'form-check';
    }
@endphp

<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif" class="roro-wrapper roro-wrapper-radio {{ $wrapperClass }} @if($hasTopMargins) mt-4 @endif">
    <input
        type="radio"
        name="{{ $name }}"
        id="{{ $id }}"
        value="{{ $value }}"
        @if($required) aria-required="true" @endif
        {{ ($required && !$disableJsValidation) ? 'required' : '' }}
        @if($disabled)
            disabled
        @endif
        @if($readonly)
            readonly
        @endif
        {{ $attributes->class([
            'roro-input roro-input-radio form-check-input',
            $class,
        ]) }}
        @if($checked) checked @endif
    >

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="roro-label roro-label-radio form-check-label {{ $labelClass }}">
            {{ $label }}
            @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif
</div>
