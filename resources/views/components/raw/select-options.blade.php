{{--
    Renders a select's options (and categories) SERVER-SIDE, straight into the
    dropdown. $options format:
      ['Group' => ['key' => 'Label', ...], 'simpleKey' => 'Simple label', ...]
    An array value => category (with its options); otherwise => a single option.
--}}
@foreach ($options as $key => $value)
    @if (is_array($value))
        <x-roro-select-category :category="$key">
            @foreach ($value as $optionKey => $optionLabel)
                <x-roro-select-option :value="$optionKey" :label="$optionLabel" />
            @endforeach
        </x-roro-select-category>
    @else
        <x-roro-select-option :value="$key" :label="$value" />
    @endif
@endforeach
