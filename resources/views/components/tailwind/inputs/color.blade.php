<div id="roro-wrapper-{{$id}}"
     style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-color w-full {{$wrapperClass}} @if($hasTopMargins) mt-6 @endif">

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="block text-gray-700 font-medium mb-1 {{$labelClass}}">
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
                {{ $disabled ? 'disabled' : '' }}
                {{ $readonly ? 'readonly' : '' }}
                {{ ($required && !$disableJsValidation) ? 'required' : '' }}
                class="roro-input roro-input-color sr-only peer"
                onchange="this.nextElementSibling.style.backgroundColor=this.value; this.nextElementSibling.nextElementSibling.value=this.value;"
            >

            <label id="label-{{$id}}" for="{{ $id }}"
                   class="roro-label roro-label-color h-12 w-12 rounded-full border border-gray-300 shadow cursor-pointer transition
                      peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:border-blue-500
                      "
                   style="background-color: {{ $value }};">
            </label>

            <input
                type="text"
                style="@if($hideTextInput) display:none;@endif"
                value="{{ $value }}"
                readonly
                class="roro-input flex-1 px-3 py-2 border rounded-md bg-gray-50 text-gray-700 text-sm font-mono select-none
                   focus:outline-none cursor-default"
            >
        </div>
    </x-roro-border-error>

    <x-roro-error :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
