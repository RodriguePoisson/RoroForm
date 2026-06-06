<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-month w-100 {{$wrapperClass}} @if($hasTopMargins) mt-4 @endif">

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}"
               class="roro-label roro-label-month form-label {{$labelClass}}">
            {{ $label }}
            @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError">
        <div class="position-relative">
            <input
                type="month"
                name="{{ $name }}"
                id="{{ $id }}"
                value="{{ $value }}"
                @if($list)
                    list="{{$list}}"
                @endif
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
                @if(!is_null($min)) min="{{ $min }}" @endif
                @if(!is_null($max)) max="{{ $max }}" @endif
                @if(!is_null($step)) step="{{ $step }}" @endif
                {{ $attributes->class([
                    'roro-input roro-input-month form-control',
                    $class,
                ]) }}
            >
        </div>
    </x-roro-border-error>

    <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
