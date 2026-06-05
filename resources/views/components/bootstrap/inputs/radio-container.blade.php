<fieldset
    {{ $attributes->class([
        'roro-wrapper-radio-container',
        'mt-4' => $hasTopMargins,
        $fieldsetClass,
    ]) }}>
    <x-roro-border-error :hidden="!$error || !$enableError" padding="p-3">
        <legend class="{{$labelClass}}">{{$label}}</legend>
        @if($subtitle)
            <p class="{{$subtitleClass}}">{{$subtitle}}</p>
        @endif
        <div class="roro-input d-flex flex-column flex-sm-row flex-sm-wrap gap-2 gap-sm-3 mb-3 {{$wrapperClass}}">
            {{$slot}}
        </div>
        <x-roro-error :hidden="!$enableError" :error="$error"></x-roro-error>
    </x-roro-border-error>
</fieldset>
