<x-roro-select-helper></x-roro-select-helper>
<div id="roro-wrapper-{{$id}}"
     data-value="{{$value}}"
     data-id="{{$id}}"
     data-disable="{{$disabled}}"
     data-readonly="{{$readonly}}"
     style="@if($hidden) display:none; @endif"
     data-show="{{$optionsOpen}}"
     class="roro-wrapper roro-wrapper-select w-100 {{$wrapperClass}} @if($hasTopMargins) mt-4 @endif">

    @if($label)
        <label id="label-{{$id}}" data-id="{{$id}}" class="roro-label roro-label-select form-label {{$labelClass}}">
            {{ $label }}
            @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError">
        <div class="w-100 position-relative">
            <div class="position-relative">
                <input
                    data-id="{{$id}}"
                    type="text"
                    role="combobox"
                    aria-expanded="false"
                    aria-controls="roro-listbox-{{$id}}"
                    aria-autocomplete="list"
                    aria-haspopup="listbox"
                    aria-activedescendant=""
                    @if($label) aria-labelledby="label-{{$id}}" @endif
                    @if($enableError) aria-describedby="roro-error-{{ $id }}" @endif
                    aria-invalid="{{ $error ? 'true' : 'false' }}"
                    @if($required) aria-required="true" @endif
                    placeholder="{{ $placeholder }}"
                    {{ $attributes->class([
                        'roro-select-text-input form-control pe-5',
                        $class,
                    ]) }}
                    {{ ($required && !$disableJsValidation)? 'required' : '' }}
                    @if($disabled) disabled @endif
                    @if($readonly) readonly @endif
                >

                <button
                    type="button"
                    class="roro-select-clear-button position-absolute top-0 bottom-0 end-0 d-flex align-items-center pe-3 border-0 bg-transparent text-secondary"
                    aria-label="Clear selection"
                    tabindex="-1"
                >
                    ✕
                </button>
            </div>

            <x-roro-hidden :disabled="$disabled" :readonly="$readonly" name="{{ $name }}" :id="$id" class="roro-select-hidden" :value="$value"></x-roro-hidden>

            <div id="roro-listbox-{{$id}}" role="listbox" @if($label) aria-labelledby="label-{{$id}}" @endif data-id="{{$id}}" class="roro-select-dropdown position-absolute mt-1 w-100 rounded border bg-white shadow overflow-auto" style="z-index:10; max-height:15rem;">
                @include("roroform::components.{$theme}.select-options", ['options' => $options])
            </div>

            {{-- Hidden templates cloned by the JS for dynamic adds (option/category). --}}
            <div class="roro-select-templates" hidden aria-hidden="true">
                <x-roro-select-option/>
                <x-roro-select-category/>
            </div>
        </div>
    </x-roro-border-error>

    <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
