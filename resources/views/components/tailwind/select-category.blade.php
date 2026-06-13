<div id="{{$id}}" role="group" aria-label="{{$category}}" data-category="{{$category}}" class="roro-select-category" style="@if($hidden) display:none; @endif">
    <div class="roro-select-category-label px-3.5 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800 sticky top-0 {{$class}}">
        {{$category}}
    </div>
    <div class="roro-select-category-options-container">{{ $slot }}</div>
</div>
