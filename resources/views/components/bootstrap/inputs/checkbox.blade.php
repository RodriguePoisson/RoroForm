@php
    // Native Bootstrap .form-check: display:block (not !important), so the
    // inline display:none from $hidden still works (unlike .d-flex).
    if(!$wrapperClass){
            $wrapperClass = 'form-check';
        }
@endphp
<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif" class="roro-wrapper roro-wrapper-checkbox {{ $wrapperClass }} @if($hasTopMargins) mt-4 @endif">
    <input
        type="checkbox"
        name="{{ $name }}"
        id="{{ $id }}"
        value="{{ $value }}"
        @if($enableError) aria-describedby="roro-error-{{ $id }}" @endif
        aria-invalid="{{ $error ? 'true' : 'false' }}"
        @if($required) aria-required="true" @endif
        @if($disabled)
                disabled
            @endif
            @if($readonly)
                readonly
            @endif
{{ ($required && !$disableJsValidation)? 'required' : '' }}
        {{ $attributes->class([
            'roro-input roro-input-checkbox form-check-input',
            $class,
        ]) }}
        @if($checked) checked @endif
    >

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="roro-label roro-label-checkbox form-check-label {{ $labelClass }}">
            {{ $label }} @if($required)<x-roro-required-label></x-roro-required-label>@endif
        </label>
    @endif
</div>

@if($enableError)
    <x-roro-error :id="'roro-error-'.$id" :error="$error"></x-roro-error>
@endif
