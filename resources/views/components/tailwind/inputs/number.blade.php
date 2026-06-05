<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-number w-full {{$wrapperClass}} @if($hasTopMargins) mt-6 @endif">
    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="roro-label roro-label-number block text-gray-700 font-medium mb-1 {{$labelClass}}">
            {{ $label }} @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError">
        <input
            type="number"
            name="{{ $name }}"
            id="{{ $id }}"
            value="{{ $value }}"
            @if($list)
                list="{{$list}}"
            @endif
            placeholder="{{ $placeholder }}"
            @if($disabled)
                disabled
            @endif
            @if($readonly)
                readonly
            @endif
            {{ ($required && !$disableJsValidation)? 'required' : '' }}
            min="{{ $min ?? 0 }}"
            max="{{ $max ?? 100 }}"
            step="{{ $step ?? 1 }}"
            {{ $attributes->class([
                'roro-input roro-input-number w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 sm:text-sm md:text-base lg:text-lg transition-colors duration-200',
                $class,
            ]) }}
        >
    </x-roro-border-error>

    <x-roro-error :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
