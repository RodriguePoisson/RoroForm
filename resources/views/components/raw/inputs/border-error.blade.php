{{-- Structural wrapper. The red invalid styling is driven by aria-invalid on
     the control itself (set server-side and toggled by roroShowError). --}}
<div id="{{$id}}" data-class="roro-border-error {{ $padding }} {{$wrapperClass}}" data-show="{{ $hidden ? '0' : '1' }}" {{ $attributes->class(['roro-border-error']) }}>
    {{$slot}}
</div>
