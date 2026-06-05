<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-checkbox @if($hasTopMargins) roro-mt @endif {{ $wrapperClass }}">
    <input
        type="checkbox"
        name="{{ $name }}"
        id="{{ $id }}"
        value="{{ $value }}"
        @if($enableError) aria-describedby="roro-error-{{ $id }}" @endif
        aria-invalid="{{ $error ? 'true' : 'false' }}"
        @if($required) aria-required="true" @endif
        @if($disabled) disabled @endif
        @if($readonly) readonly @endif
        {{ ($required && !$disableJsValidation)? 'required' : '' }}
        {{ $attributes->class([
            'roro-input roro-input-checkbox',
            $class,
        ]) }}
        @if($checked) checked @endif
    >

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="roro-label roro-label-checkbox {{ $labelClass }}">
            {{ $label }} @if($required)<x-roro-required-label></x-roro-required-label>@endif
        </label>
    @endif
</div>

@if($enableError)
    <x-roro-error :id="'roro-error-'.$id" :error="$error"></x-roro-error>
@endif
