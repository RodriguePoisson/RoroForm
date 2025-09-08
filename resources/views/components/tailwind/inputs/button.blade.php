<button @if($disabled) disabled @endif type="{{$type}}" data-form-id="{{$formId}}" class="roro-btn @if($type == 'submit')roro-btn-submit @endif @if($hasTopMargins) mt-6  @endif {{$buttonColor}} {{$buttonTextColor}} font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-lg shadow-md hover:{{$buttonHoverColor}} transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 {{$class}}" id="{{$id}}" data-ajax-errors="{{$enableAjaxErrors}}" data-ajax="{{$ajax}}">
    {{$slot}}
</button>
