<x-roro-file-helper></x-roro-file-helper>
<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-file @if($hasTopMargins) roro-mt @endif {{$wrapperClass}}">

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="roro-label roro-label-file {{$labelClass}}">
            {{ $label }} @if($required)<x-roro-required-label></x-roro-required-label>@endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError">
        <div class="roro-drop-zone drop-zone {{$class}}">
            <span>{{ $placeholder }}</span>
            <span class="roro-file-hint">{{ $requirementsText }}</span>
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
                data-max-size="{{ $maxSize }}"
                {{ $attributes->class(['roro-input roro-input-file']) }}
            >
        </div>
    </x-roro-border-error>

    <p class="roro-file-name-container">
        <span class="roro-file-name" style="display:none;">
            <span class="roro-file-name-text"></span>
            <button type="button" class="roro-file-name-delete" aria-label="Remove">✕</button>
        </span>
    </p>

    <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
