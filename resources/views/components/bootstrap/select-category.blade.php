<div id="{{$id}}" role="group" aria-label="{{$category}}" data-category="{{$category}}" class="roro-select-category" style="@if($hidden) display:none; @endif">
    <div class="roro-select-category-label px-3 py-2 small fw-semibold text-uppercase text-muted bg-body-tertiary position-sticky top-0 {{$class}}" style="letter-spacing:.05em;">
        {{$category}}
    </div>
    <div class="roro-select-category-options-container">{{ $slot }}</div>
</div>
