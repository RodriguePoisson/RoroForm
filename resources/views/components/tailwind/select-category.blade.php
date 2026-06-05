<div id="{{$id}}" data-category="{{$category}}" class="roro-select-category" style="@if($hidden) display:none; @endif">
    <div class="roro-select-category-label px-3 py-2 font-semibold text-gray-500 bg-gray-100 sticky top-0 {{$class}}">
        {{$category}}
    </div>
    <div class="roro-select-category-options-container">{{ $slot }}</div>
</div>
