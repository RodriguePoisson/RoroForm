<fieldset
    @if($error) aria-invalid="true" @endif
    {{ $attributes->class([
        'roro-wrapper-radio-container',
        'mt-6' => $hasTopMargins,
        $fieldsetClass,
    ]) }}>
    <x-roro-border-error :hidden="!$error || !$enableError" padding="p-4">
        <legend class="{{$labelClass}}">{{$label}}</legend>
        @if($subtitle)
            <p class="{{$subtitleClass}}">{{$subtitle}}</p>
        @endif
        <div class="roro-input flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mb-4 {{$wrapperClass}}">
            {{$slot}}
        </div>
        <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>
    </x-roro-border-error>
</fieldset>
