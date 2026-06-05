<button @if($disabled) disabled @endif type="{{$type}}" data-form-id="{{$formId}}" id="{{$id}}" data-ajax-errors="{{$enableAjaxErrors}}" data-ajax="{{$ajax}}" {{ $attributes->class([
    'roro-btn',
    'roro-btn-submit' => $type === 'submit',
    'roro-mt' => $hasTopMargins,
    $class,
]) }}>
    {{$slot}}
</button>
