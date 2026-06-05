<fieldset
    @if($error) aria-invalid="true" @endif
    {{ $attributes->class([
        'roro-wrapper-radio-container',
        'roro-mt' => $hasTopMargins,
        $fieldsetClass,
    ]) }}>
    <x-roro-border-error :hidden="!$error || !$enableError">
        <legend class="{{$labelClass}}">{{$label}}</legend>
        @if($subtitle)
            <p class="roro-radio-subtitle {{$subtitleClass}}">{{$subtitle}}</p>
        @endif
        <div class="roro-input roro-radio-group {{$wrapperClass}}">
            {{$slot}}
        </div>
        <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>
    </x-roro-border-error>
</fieldset>
