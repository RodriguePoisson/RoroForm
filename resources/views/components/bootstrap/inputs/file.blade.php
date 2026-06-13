<x-roro-file-helper></x-roro-file-helper>
<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-file w-100 {{$wrapperClass}} @if($hasTopMargins) mt-4 @endif">

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}"
               class="roro-label roro-label-file form-label {{$labelClass}}">
            {{ $label }}
            @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError">
        <div class="roro-drop-zone drop-zone d-flex flex-column align-items-center justify-content-center gap-1 w-100 rounded border border-2 bg-body-tertiary position-relative {{$class}}"
             style="height:8rem; cursor:pointer; border-style:dashed !important;">

            <span class="fw-medium text-body">
                {{ $placeholder}}
            </span>
            <span class="small text-muted mt-1">
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
                    'roro-input roro-input-file file-input position-absolute top-0 start-0 w-100 h-100 opacity-0',
                ]) }}
                style="cursor:pointer;"
                data-max-size="{{ $maxSize }}"
            >
        </div>
    </x-roro-border-error>

    <p class="roro-file-name-container mt-2 small text-body">
        {{-- .badge gives display:inline-block (not !important), so the JS clone()
             + show()/hide() on this template still works (unlike .d-inline-flex). --}}
        <span style="display: none;"
            class="roro-file-name badge rounded-pill bg-primary bg-opacity-10 text-primary fw-medium px-3 py-2 me-2 mt-1">
            <span class="roro-file-name-text"></span>
            <button type="button" aria-label="Remove"
                    class="roro-file-name-delete ms-2 p-0 border-0 bg-transparent text-primary align-middle lh-1">
                ✕
            </button>
        </span>
    </p>

    <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
