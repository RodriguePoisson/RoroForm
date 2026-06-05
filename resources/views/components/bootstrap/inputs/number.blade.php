<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-number w-100 {{$wrapperClass}} @if($hasTopMargins) mt-4 @endif">
    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="roro-label roro-label-number form-label {{$labelClass}}">
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
                'roro-input roro-input-number form-control',
                $class,
            ]) }}
        >
    </x-roro-border-error>

    <x-roro-error :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
