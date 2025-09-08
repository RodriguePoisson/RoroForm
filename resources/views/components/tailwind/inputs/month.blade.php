<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-month w-full {{$wrapperClass}} @if($hasTopMargins) mt-6 @endif">

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}"
               class="roro-label roro-label-month block text-gray-700 font-semibold mb-2 {{$labelClass}}">
            {{ $label }}
            @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError">
        <div class="relative">
            <input
                type="month"
                name="{{ $name }}"
                id="{{ $id }}"
                value="{{ $value }}"
                @if($list)
                    list="{{$list}}"
                @endif
                @if($disabled)
                    disabled
                @endif
                @if($readonly)
                    readonly
                @endif
                {{ ($required && !$disableJsValidation)? 'required' : '' }}
                @if(!is_null($min)) min="{{ $min }}" @endif
                @if(!is_null($max)) max="{{ $max }}" @endif
                @if(!is_null($step)) step="{{ $step }}" @endif
                class="roro-input roro-input-month peer w-full border border-gray-300 bg-white px-4 py-3
                   text-gray-800 placeholder-transparent
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none
                   sm:text-sm md:text-base lg:text-lg transition-all duration-200 {{$class}}"
            >
        </div>
    </x-roro-border-error>

    <x-roro-error :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
