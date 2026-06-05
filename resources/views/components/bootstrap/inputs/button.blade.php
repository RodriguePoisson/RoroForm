<button @if($disabled) disabled @endif type="{{$type}}" data-form-id="{{$formId}}" {{ $attributes->class([
    'roro-btn',
    'roro-btn-submit' => $type === 'submit',
    'mt-4' => $hasTopMargins,
    'btn btn-primary',
    $class,
]) }} id="{{$id}}" data-ajax-errors="{{$enableAjaxErrors}}" data-ajax="{{$ajax}}">
    {{$slot}}
</button>
