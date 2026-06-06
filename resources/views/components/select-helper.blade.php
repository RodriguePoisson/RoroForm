@once
    @push('roro-select-scripts')
        <script{!! $cspNonce ? ' nonce="'.e($cspNonce).'"' : '' !!}>
            {!! file_get_contents(realpath($getJsPath() . 'Selectable.min.js')) !!}
            {!! file_get_contents(realpath($getJsPath() . 'select.min.js')) !!}
        </script>
        @if($theme !== 'raw')
            {{-- Keyboard-active option highlight (WCAG 2.4.7 Focus Visible). The raw
                 theme styles .roro-option-active in its own stylesheet; the utility
                 themes have none, so the keyboard-active option would be invisible. --}}
            <style{!! $cspNonce ? ' nonce="'.e($cspNonce).'"' : '' !!}>
                @if($theme === 'bootstrap')
                .roro-select-option.roro-option-active { background-color: var(--bs-primary-bg-subtle, rgba(13, 110, 253, .1)); box-shadow: inset 2px 0 0 var(--bs-primary, #0d6efd); }
                @else
                .roro-select-option.roro-option-active { background-color: #eff6ff; box-shadow: inset 2px 0 0 #3b82f6; }
                @endif
            </style>
        @endif
    @endpush
@endonce
