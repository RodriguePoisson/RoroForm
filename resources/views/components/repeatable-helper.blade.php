@once
    @push('roro-select-scripts')
        <script{!! $cspNonce ? ' nonce="'.e($cspNonce).'"' : '' !!}>
            {!! file_get_contents(realpath($getJsPath() . 'RoroRepeatable.min.js')) !!}
            {!! file_get_contents(realpath($getJsPath() . 'repeatable.min.js')) !!}
        </script>
    @endpush

    {{-- Theme-agnostic cohesion the utility classes can't express cross-theme:
         tighten the inner fields so a row reads as one unit, and draw a divider
         between rows so the whole group reads as a single input. --}}
    <style{!! $cspNonce ? ' nonce="'.e($cspNonce).'"' : '' !!}>
        .roro-repeatable-row-content > * { margin-top: .65rem !important; }
        .roro-repeatable-row-content > *:first-child { margin-top: 0 !important; }
        .roro-repeatable-rows > .roro-repeatable-row + .roro-repeatable-row { border-top: 1px solid rgba(0, 0, 0, .08); }
        .roro-repeatable-row[data-roro-locked="1"] .roro-repeatable-remove { cursor: not-allowed; }
        .roro-repeatable-handle { cursor: grab; user-select: none; line-height: 1; }
        .roro-repeatable-row.roro-repeatable-dragging { opacity: .45; cursor: grabbing; }
        .roro-repeatable-row.roro-repeatable-drag-over { background: rgba(59, 130, 246, .06); }
    </style>
@endonce
