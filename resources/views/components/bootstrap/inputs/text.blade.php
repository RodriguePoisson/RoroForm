<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-text w-100 {{$wrapperClass}} @if($hasTopMargins) mt-4 @endif">
    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="roro-label roro-label-text form-label {{$labelClass}}">
            {{ $label }} @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError">
        <input
            type="{{$type}}"
            name="{{ $name }}"
            id="{{ $id }}"
            value="{{ $value }}"
            placeholder="{{ $placeholder }}"
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
                'roro-input roro-input-text form-control',
                $class,
            ]) }}
        >
    </x-roro-border-error>

    <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
