<x-roro-select-helper></x-roro-select-helper>
<div id="roro-wrapper-{{$id}}"
     data-values='@json($values)'
     data-id="{{$id}}"
     data-name="{{$name}}"
     data-disable="{{$disabled}}"
     data-readonly="{{$readonly}}"
     style="@if($hidden) display:none; @endif"
     data-show="{{$optionsOpen}}"
     class="roro-wrapper roro-wrapper-multi-select @if($hasTopMargins) roro-mt @endif {{$wrapperClass}}">

    @if($label)
        <label id="label-{{$id}}" data-id="{{$id}}" class="roro-label roro-label-multi-select {{$labelClass}}">
            {{ $label }} @if($required)<x-roro-required-label></x-roro-required-label>@endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError">
        <div class="roro-select-shell">
            <div
                data-id="{{$id}}"
                contenteditable="true"
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
                    'roro-select-text-input',
                    $class,
                ]) }}
                {{ ($required && !$disableJsValidation)? 'required' : '' }}
                @if($disabled) disabled @endif
                @if($readonly) readonly @endif
            ></div>

            <button type="button" class="roro-select-clear-button" aria-label="Clear selection" tabindex="-1">✕</button>

            <div id="roro-listbox-{{$id}}" role="listbox" aria-multiselectable="true" @if($label) aria-labelledby="label-{{$id}}" @endif data-id="{{$id}}" class="roro-select-dropdown">
                @include("roroform::components.{$theme}.select-options", ['options' => $options])
            </div>

            {{-- Hidden templates cloned by the JS for dynamic adds (option/category/tag). --}}
            <div class="roro-select-templates" hidden aria-hidden="true">
                <x-roro-select-option/>
                <x-roro-select-category/>
                <x-roro-multi-select-text-tag/>
            </div>
        </div>
    </x-roro-border-error>

    <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
