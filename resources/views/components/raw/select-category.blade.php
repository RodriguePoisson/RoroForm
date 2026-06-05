<div id="{{$id}}" role="group" aria-label="{{$category}}" data-category="{{$category}}" class="roro-select-category" style="@if($hidden) display:none; @endif">
    <div class="roro-select-category-label" aria-hidden="true">{{$category}}</div>
    <div class="roro-select-category-options-container">{{ $slot }}</div>
</div>
