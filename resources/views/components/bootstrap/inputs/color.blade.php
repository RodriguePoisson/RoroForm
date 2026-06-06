<div id="roro-wrapper-{{$id}}"
     style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-color w-100 {{$wrapperClass}} @if($hasTopMargins) mt-4 @endif">

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="roro-label roro-label-color form-label {{$labelClass}}">
            {{ $label }}
            @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError" padding="p-3">
        <div class="position-relative d-flex align-items-center gap-3">
            <input
                type="color"
                name="{{ $name }}"
                id="{{ $id }}"
                value="{{ $value }}"
                @if($enableError) aria-describedby="roro-error-{{ $id }}" @endif
                aria-invalid="{{ $error ? 'true' : 'false' }}"
                @if($required) aria-required="true" @endif
                {{ $disabled ? 'disabled' : '' }}
                {{ $readonly ? 'readonly' : '' }}
                {{ ($required && !$disableJsValidation) ? 'required' : '' }}
                {{ $attributes->class([
                    'roro-input roro-input-color visually-hidden',
                ]) }}
                onchange="this.nextElementSibling.style.backgroundColor=this.value; this.nextElementSibling.nextElementSibling.value=this.value;"
            >

            <label for="{{ $id }}"
                   class="roro-label roro-label-color rounded-circle border shadow"
                   style="height:3rem; width:3rem; cursor:pointer; background-color: {{ $value }};">
            </label>

            <input
                type="text"
                style="@if($hideTextInput) display:none;@endif"
                value="{{ $value }}"
                readonly
                aria-hidden="true"
                tabindex="-1"
                class="roro-input form-control flex-grow-1 bg-light text-body font-monospace user-select-none"
            >
        </div>
    </x-roro-border-error>

    <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
