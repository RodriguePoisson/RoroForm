<x-roro-file-helper></x-roro-file-helper>
<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-file w-full {{$wrapperClass}} @if($hasTopMargins) mt-6 @endif">

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}"
               class="roro-label roro-label-file block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 {{$labelClass}}">
            {{ $label }}
            @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError">
        <div class="roro-drop-zone drop-zone flex flex-col items-center justify-center gap-1 w-full h-32 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 cursor-pointer transition hover:border-indigo-400 hover:bg-indigo-50 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/10 relative {{$class}}">

            <span class="font-medium text-zinc-700 dark:text-zinc-300">
                {{ $placeholder}}
            </span>
            <span class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
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
                @if($enableError) aria-describedby="roro-error-{{ $id }}" @endif
                aria-invalid="{{ $error ? 'true' : 'false' }}"
                @if($required) aria-required="true" @endif
                {{ $attributes->class([
                    'roro-input roro-input-file file-input absolute inset-0 w-full h-full opacity-0 cursor-pointer',
                ]) }}
                data-max-size="{{ $maxSize }}"
            >
        </div>
    </x-roro-border-error>

    <p class="roro-file-name-container mt-2 text-sm text-zinc-700 dark:text-zinc-300">
        <span style="display: none;"
            class="roro-file-name inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 text-sm font-medium mr-2 mt-1">
            <span class="roro-file-name-text"></span>
            <button type="button" aria-label="Remove"
                    class="roro-file-name-delete ml-2 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none">
                ✕
            </button>
        </span>
    </p>

    <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
