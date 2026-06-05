<x-roro-helper></x-roro-helper>
<x-roro-raw-styles></x-roro-raw-styles>
@stack('roro-styles')
@stack('roro-global-scripts')
@stack('roro-select-scripts')

<form id="{{$id}}" class="roro-form {{$class}}" method="{{$method}}" action="{{$action}}" @if($multipart) enctype="multipart/form-data" @endif @if($enctype) enctype="{{$enctype}}" @endif>
    @if($csrf)
        @csrf
    @endif
    {{$slot}}
</form>

@if($overlay)
    <x-roro-overlay></x-roro-overlay>
@endif
