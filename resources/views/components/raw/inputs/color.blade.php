<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-color @if($hasTopMargins) roro-mt @endif {{$wrapperClass}}">

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="roro-label roro-label-color {{$labelClass}}">
            {{ $label }} @if($required)<x-roro-required-label></x-roro-required-label>@endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError">
        <div style="display:flex;align-items:center;gap:.75rem;">
            <input
                type="color"
                name="{{ $name }}"
                id="{{ $id }}"
                value="{{ $value }}"
                @if($enableError) aria-describedby="roro-error-{{ $id }}" @endif
                aria-invalid="{{ $error ? 'true' : 'false' }}"
                @if($required) aria-required="true" @endif
                @if($disabled) disabled @endif
                @if($readonly) readonly @endif
                {{ ($required && !$disableJsValidation)? 'required' : '' }}
                {{ $attributes->class(['roro-input roro-input-color', $class]) }}
                onchange="this.nextElementSibling.value=this.value;"
            >
            <input
                type="text"
                style="@if($hideTextInput) display:none; @endif"
                value="{{ $value }}"
                readonly
                aria-hidden="true"
                tabindex="-1"
                class="roro-input roro-input-color-text"
            >
        </div>
    </x-roro-border-error>

    <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
