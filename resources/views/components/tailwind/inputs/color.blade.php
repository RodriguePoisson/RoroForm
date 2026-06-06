<div id="roro-wrapper-{{$id}}"
     style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-color w-full {{$wrapperClass}} @if($hasTopMargins) mt-6 @endif">

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="roro-label roro-label-color block text-sm font-medium text-gray-700 mb-1.5 {{$labelClass}}">
            {{ $label }}
            @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError" padding="p-4">
        <div class="relative flex items-center gap-3">
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
                    'roro-input roro-input-color sr-only peer',
                ]) }}
                onchange="this.nextElementSibling.style.backgroundColor=this.value; this.nextElementSibling.nextElementSibling.value=this.value;"
            >

            <label for="{{ $id }}"
                   class="roro-label roro-label-color h-12 w-12 rounded-full border border-gray-300 shadow cursor-pointer transition
                      peer-focus:ring-2 peer-focus:ring-blue-200 peer-focus:border-blue-500
                      "
                   style="background-color: {{ $value }};">
            </label>

            <input
                type="text"
                style="@if($hideTextInput) display:none;@endif"
                value="{{ $value }}"
                readonly
                aria-hidden="true"
                tabindex="-1"
                class="roro-input flex-1 rounded-lg border border-gray-300 px-3.5 py-2.5 bg-gray-50 text-gray-700 text-sm font-mono select-none
                   focus:outline-none cursor-default"
            >
        </div>
    </x-roro-border-error>

    <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
