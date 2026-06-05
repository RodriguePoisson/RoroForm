<div id="{{$id}}"
     data-class="roro-border-error border border-red-500 {{ $padding }} {{$wrapperClass}}"
     data-show="{{ $hidden ? '0' : '1' }}"
     {{ $attributes->class(['roro-border-error']) }}>
    <div class="w-full">
        {{$slot}}
    </div>
</div>
