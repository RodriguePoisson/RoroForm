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
                {{-- With a dropdown search bar the search input is the ARIA combobox;
                     this field just displays the current selection (read-only). --}}
                <input
                    data-id="{{$id}}"
                    type="text"
                    @unless($searchBar)
                        role="combobox"
                        aria-expanded="false"
                        aria-controls="roro-listbox-{{$id}}"
                        aria-autocomplete="list"
                        aria-haspopup="listbox"
                        aria-activedescendant=""
                    @endunless
                    @if($label) aria-labelledby="label-{{$id}}" @endif
                    @if($enableError) aria-describedby="roro-error-{{ $id }}" @endif
                    aria-invalid="{{ $error ? 'true' : 'false' }}"
                    @if($required) aria-required="true" @endif
                    placeholder="{{ $placeholder }}"
                    {{ $attributes->class([
                        'roro-select-text-input form-control pe-5',
                        $class,
                    ]) }}
                    @if($searchBar) style="cursor:pointer;" @endif
                    {{ ($required && !$disableJsValidation)? 'required' : '' }}
                    @if($disabled) disabled @endif
                    @if($readonly || $searchBar) readonly @endif
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

            <div data-id="{{$id}}" class="roro-select-dropdown position-absolute mt-1 w-100 rounded border bg-white shadow overflow-auto" style="z-index:10; max-height:15rem;">
                @if($searchBar)
                    <div class="roro-select-search position-sticky top-0 bg-white px-2 py-2 border-bottom" style="z-index:11;">
                        <input
                            type="text"
                            data-id="{{$id}}"
                            role="combobox"
                            aria-expanded="false"
                            aria-controls="roro-listbox-{{$id}}"
                            aria-autocomplete="list"
                            aria-haspopup="listbox"
                            aria-activedescendant=""
                            aria-label="@if($label){{ 'Search '.$label }}@else{{ 'Search options' }}@endif"
                            placeholder="{{ $searchPlaceholder }}"
                            autocomplete="off"
                            class="roro-select-search-input form-control form-control-sm"
                        >
                    </div>
                @endif
                <div id="roro-listbox-{{$id}}" role="listbox" @if($label) aria-labelledby="label-{{$id}}" @endif class="roro-select-listbox">
                    @include("roroform::components.{$theme}.select-options", ['options' => $options])
                </div>
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
