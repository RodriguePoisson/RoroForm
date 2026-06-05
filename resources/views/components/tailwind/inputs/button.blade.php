<button @if($disabled) disabled @endif type="{{$type}}" data-form-id="{{$formId}}" {{ $attributes->class([
    'roro-btn',
    'roro-btn-submit' => $type === 'submit',
    'mt-6' => $hasTopMargins,
    $buttonColor,
    $buttonTextColor,
    'font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50',
    'hover:'.$buttonHoverColor,
    $class,
]) }} id="{{$id}}" data-ajax-errors="{{$enableAjaxErrors}}" data-ajax="{{$ajax}}">
    {{$slot}}
</button>
