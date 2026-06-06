@php
    if (!$wrapperClass) {
        $wrapperClass = 'flex items-center gap-3';
    }
@endphp

<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif" class="roro-wrapper roro-wrapper-radio {{ $wrapperClass }} @if($hasTopMargins) mt-6 @endif">
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
            'roro-input roro-input-radio h-4 w-4 appearance-none rounded-full border border-gray-300 bg-white transition checked:border-[5px] checked:border-blue-600 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200',
            $class,
        ]) }}
        @if($checked) checked @endif
    >

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="roro-label roro-label-radio cursor-pointer select-none text-sm font-medium text-gray-700 {{ $labelClass }}">
            {{ $label }}
            @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif
</div>
