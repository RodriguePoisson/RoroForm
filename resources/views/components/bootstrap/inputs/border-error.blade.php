<div id="{{$id}}"
     data-class="roro-border-error border border-danger rounded {{ $padding }} {{$wrapperClass}}"
     data-show="{{!$hidden}}"
     {{ $attributes->class(['roro-border-error']) }}>
    <div class="w-100">
        {{$slot}}
    </div>
</div>
