<input @if($disabled)
           disabled
       @endif
       @if($readonly)
           readonly
       @endif id="{{$id}}"
       {{ $attributes->class([
           'roro-input roro-input-hidden',
           $class,
       ]) }}
       name="{{$name}}"
       type="hidden"
       value="{{$value}}">
