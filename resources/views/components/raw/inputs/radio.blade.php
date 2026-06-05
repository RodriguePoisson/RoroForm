<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-radio {{ $wrapperClass }}">
    <input
        type="radio"
        name="{{ $name }}"
        id="{{ $id }}"
        value="{{ $value }}"
        @if($required) aria-required="true" @endif
        @if($disabled) disabled @endif
        @if($readonly) readonly @endif
        {{ ($required && !$disableJsValidation) ? 'required' : '' }}
        {{ $attributes->class([
            'roro-input roro-input-radio',
            $class,
        ]) }}
        @if($checked) checked @endif
    >

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="roro-label roro-label-radio {{ $labelClass }}">
            {{ $label }} @if($required)<x-roro-required-label></x-roro-required-label>@endif
        </label>
    @endif
</div>
