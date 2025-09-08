<fieldset
    class="roro-wrapper-radio-container @if($hasTopMargins) mt-6 @endif{{$fieldsetClass}}">
    <x-roro-border-error :hidden="!$error || !$enableError" padding="p-4">
        <legend class="{{$labelClass}}">{{$label}}</legend>
        @if($subtitle)
            <p class="{{$subtitleClass}}">{{$subtitle}}</p>
        @endif
        <div class="roro-input flex gap-4 mb-4 {{$wrapperClass}}">
            {{$slot}}
        </div>
        <x-roro-error :hidden="!$enableError" :error="$error"></x-roro-error>
    </x-roro-border-error>
</fieldset>
