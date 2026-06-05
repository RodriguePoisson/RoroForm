<div id="{{$id}}"
     data-class="roro-border-error border border-danger rounded {{ $padding }} {{$wrapperClass}}"
     data-show="{{ $hidden ? '0' : '1' }}"
     {{ $attributes->class(['roro-border-error']) }}>
    <div class="w-100">
        {{$slot}}
    </div>
</div>
