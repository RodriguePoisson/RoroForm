<div id="{{$id}}"
     style="@if($hidden) display:none; @endif"
     data-value="{{$value}}"
     data-label="{{$label}}"
     class="roro-select-option relative cursor-pointer px-3 py-2 hover:bg-indigo-100 {{$class}}">

    <!-- Overlay -->
    <span style="display: none;" class="roro-select-option-overlay absolute inset-0 bg-black opacity-30 pointer-events-none"></span>

    <span class="roro-select-option-label relative z-10">{{$label}}</span>
    <span style="display: none;" class="roro-select-option-check absolute right-2 top-1/2 -translate-y-1/2 hidden text-indigo-600 z-10">✔</span>
</div>
