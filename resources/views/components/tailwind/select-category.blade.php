<div id="{{$id}}" data-category="{{$category}}" class="roro-select-category" style="@if($hidden) display:none; @endif">
    <div class="roro-select-category-label px-3.5 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 sticky top-0 {{$class}}">
        {{$category}}
    </div>
    <div class="roro-select-category-options-container">{{ $slot }}</div>
</div>
