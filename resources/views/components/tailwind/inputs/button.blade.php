<button @if($disabled) disabled @endif type="{{$type}}" data-form-id="{{$formId}}" {{ $attributes->class([
    'roro-btn',
    'roro-btn-submit' => $type === 'submit',
    'mt-6' => $hasTopMargins,
    $buttonColor,
    $buttonTextColor,
    'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60',
    'hover:'.$buttonHoverColor,
    $class,
]) }} id="{{$id}}" data-ajax-errors="{{$enableAjaxErrors}}" data-ajax="{{$ajax}}">
    {{$slot}}
</button>
