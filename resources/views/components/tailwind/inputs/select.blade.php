<x-roro-select-helper></x-roro-select-helper>
<div id="roro-wrapper-{{$id}}"
     data-value="{{$value}}"
     data-id="{{$id}}"
     data-disable="{{$disabled}}"
     data-readonly="{{$readonly}}"
     style="@if($hidden) display:none; @endif"
     data-options='@json($options)'
     data-show="{{$optionsOpen}}"
     class="roro-wrapper roro-wrapper-select w-full {{$wrapperClass}} @if($hasTopMargins) mt-6 @endif">

    @if($label)
        <label id="label-{{$id}}" data-id="{{$id}}" class="roro-label roro-label-select block text-gray-700 font-medium mb-1 {{$labelClass}}">
            {{ $label }}
            @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError">
        <div class="w-full relative">
            <div class="relative">
                <input
                    data-id="{{$id}}"
                    type="text"
                    placeholder="{{ $placeholder }}"
                    {{ $attributes->class([
                        'roro-select-text-input w-full border py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 placeholder-gray-400 sm:text-sm md:text-base lg:text-lg transition-colors duration-200',
                        $class,
                    ]) }}
                    {{ ($required && !$disableJsValidation)? 'required' : '' }}
                    @if($disabled) disabled @endif
                    @if($readonly) readonly @endif
                >

                <button
                    type="button"
                    class="roro-select-clear-button absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
            </div>

            <x-roro-hidden :disabled="$disabled" :readonly="$readonly" name="{{ $name }}" :id="$id" class="roro-select-hidden" :value="$value"></x-roro-hidden>

            <div data-id="{{$id}}" class="roro-select-dropdown absolute z-10 mt-1 w-full bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
            </div>
        </div>
    </x-roro-border-error>

    <x-roro-error :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
