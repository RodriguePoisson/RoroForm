{{--
    Rend les options (et categories) d'un select cote SERVEUR, directement dans
    le dropdown. Format de $options :
      ['Groupe' => ['cle' => 'Label', ...], 'cleSimple' => 'Label simple', ...]
    Une valeur tableau => categorie (avec ses options) ; sinon => option simple.
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
