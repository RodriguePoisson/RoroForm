<x-roro-select-helper></x-roro-select-helper>
<div id="roro-wrapper-{{$id}}"
     data-value="{{$value}}"
     data-id="{{$id}}"
     data-disable="{{$disabled}}"
     data-readonly="{{$readonly}}"
     style="@if($hidden) display:none; @endif"
     data-show="{{$optionsOpen}}"
     class="roro-wrapper roro-wrapper-select w-full {{$wrapperClass}} @if($hasTopMargins) mt-6 @endif">

    @if($label)
        <label id="label-{{$id}}" data-id="{{$id}}" class="roro-label roro-label-select block text-sm font-medium text-gray-700 mb-1.5 {{$labelClass}}">
            {{ $label }}
            @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError">
        <div class="w-full relative">
            <div class="relative">
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
                        'roro-select-text-input block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3.5 pr-10 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200',
                        'cursor-pointer' => $searchBar,
                        $class,
                    ]) }}
                    {{ ($required && !$disableJsValidation)? 'required' : '' }}
                    @if($disabled) disabled @endif
                    @if($readonly || $searchBar) readonly @endif
                >

                <button
                    type="button"
                    class="roro-select-clear-button absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    aria-label="Clear selection"
                    tabindex="-1"
                >
                    ✕
                </button>
            </div>

            <x-roro-hidden :disabled="$disabled" :readonly="$readonly" name="{{ $name }}" :id="$id" class="roro-select-hidden" :value="$value"></x-roro-hidden>

            <div data-id="{{$id}}" class="roro-select-dropdown absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                @if($searchBar)
                    <div class="roro-select-search sticky top-0 z-10 bg-white px-2 py-2 border-b border-gray-100">
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
                            class="roro-select-search-input block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
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
