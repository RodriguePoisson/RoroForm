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
        {{ ($required && !$disableJsValidation) ? 'required' : '' }}
        @if($disabled)
            disabled
        @endif
        @if($readonly)
            readonly
        @endif
        class="roro-input roro-input-radio h-5 w-5
               appearance-none
               border-2 border-gray-300
               rounded-full
               checked:border-blue-600
               checked:bg-blue-600
               hover:border-blue-400
               focus:ring-2 focus:ring-blue-400 focus:outline-none
               transition-all duration-200
               {{$class}}"
        @if($checked) checked @endif
    >

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="roro-label roro-label-radio cursor-pointer select-none text-gray-700 font-medium {{ $labelClass }}">
            {{ $label }}
            @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif
</div>
