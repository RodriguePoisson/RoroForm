<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-time @if($hasTopMargins) roro-mt @endif {{$wrapperClass}}">

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}" class="roro-label roro-label-time {{$labelClass}}">
            {{ $label }} @if($required)<x-roro-required-label></x-roro-required-label>@endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError">
        <input
            type="time"
            name="{{ $name }}"
            id="{{ $id }}"
            value="{{ $value }}"
            @if($list) list="{{$list}}" @endif
            @if(!is_null($min)) min="{{ $min }}" @endif
            @if(!is_null($max)) max="{{ $max }}" @endif
            @if(!is_null($step)) step="{{ $step }}" @endif
            @if($enableError) aria-describedby="roro-error-{{ $id }}" @endif
            aria-invalid="{{ $error ? 'true' : 'false' }}"
            @if($required) aria-required="true" @endif
            @if($disabled) disabled @endif
            @if($readonly) readonly @endif
            {{ ($required && !$disableJsValidation)? 'required' : '' }}
            {{ $attributes->class([
                'roro-input roro-input-time',
                $class,
            ]) }}
        >
    </x-roro-border-error>

    <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
