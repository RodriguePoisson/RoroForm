<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-text w-full {{$wrapperClass}} @if($hasTopMargins) mt-6 @endif">
    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="roro-label roro-label-text block text-sm font-medium text-gray-700 mb-1.5 {{$labelClass}}">
            {{ $label }} @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError">
        <input
            type="{{$type}}"
            name="{{ $name }}"
            id="{{ $id }}"
            value="{{ $value }}"
            placeholder="{{ $placeholder }}"
            @if($enableError) aria-describedby="roro-error-{{ $id }}" @endif
            aria-invalid="{{ $error ? 'true' : 'false' }}"
            @if($required) aria-required="true" @endif
            @if($disabled)
                disabled
            @endif
            @if($readonly)
                readonly
            @endif
            {{ ($required && !$disableJsValidation)? 'required' : '' }}
            {{ $attributes->class([
                'roro-input roro-input-text block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
                $class,
            ]) }}
        >
    </x-roro-border-error>

    <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
