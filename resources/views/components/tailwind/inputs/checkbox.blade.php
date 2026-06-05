@php
    if(!$wrapperClass){
            $wrapperClass = 'flex items-center gap-2';
        }
@endphp
<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif" class="roro-wrapper roro-wrapper-checkbox {{ $wrapperClass }} @if($hasTopMargins) mt-6 @endif">
    <input
        type="checkbox"
        name="{{ $name }}"
        id="{{ $id }}"
        value="{{ $value }}"
        @if($disabled)
                disabled
            @endif
            @if($readonly)
                readonly
            @endif
{{ ($required && !$disableJsValidation)? 'required' : '' }}
        {{ $attributes->class([
            'roro-input roro-input-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 shadow-sm transition focus:ring-2 focus:ring-blue-200 focus:ring-offset-0',
            $class,
        ]) }}
        @if($checked) checked @endif
    >

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="roro-label roro-label-checkbox text-sm font-medium text-gray-700 {{ $labelClass }}">
            {{ $label }} @if($required)<x-roro-required-label></x-roro-required-label>@endif
        </label>
    @endif
</div>

@if($enableError)
    <x-roro-error :error="$error"></x-roro-error>
@endif
