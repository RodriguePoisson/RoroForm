<x-roro-file-helper></x-roro-file-helper>
<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-file w-full {{$wrapperClass}} @if($hasTopMargins) mt-6 @endif">

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}"
               class="roro-label roro-label-file block text-gray-700 font-medium mb-1 {{$labelClass}}">
            {{ $label }}
            @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError">
        <div class="roro-drop-zone drop-zone flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer
                    hover:border-blue-400 hover:bg-blue-50 transition relative {{$class}}">

            <span class="font-medium text-gray-700">
                {{ $placeholder}}
            </span>
            <span class="text-xs text-gray-500 mt-1">
                {{ $requirementsText}}
            </span>

            <input
                type="file"
                id="{{ $id }}"
                name="{{ $name }}"
                accept="{{ $accept }}"
                @if($multiple) multiple @endif
                @if($disabled) disabled @endif
                @if($readonly) readonly @endif
                {{ ($required && !$disableJsValidation)? 'required' : '' }}
                {{ $attributes->class([
                    'roro-input roro-input-file file-input absolute inset-0 w-full h-full opacity-0 cursor-pointer',
                ]) }}
                data-max-size="{{ $maxSize }}"
            >
        </div>
    </x-roro-border-error>

    <p class="roro-file-name-container mt-2 text-sm text-gray-700">
        <span style="display: none;"
            class="roro-file-name inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mr-2 mt-1">
            <span class="roro-file-name-text"></span>
            <button type="button"
                    class="roro-file-name-delete ml-2 text-blue-500 hover:text-blue-700 focus:outline-none">
                ✕
            </button>
        </span>
    </p>

    <x-roro-error :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
