@once
    @push('roro-select-scripts')
        <script{!! $cspNonce ? ' nonce="'.e($cspNonce).'"' : '' !!}>
            {!! file_get_contents(realpath($getJsPath() . 'Selectable.min.js')) !!}
            {!! file_get_contents(realpath($getJsPath() . 'select.min.js')) !!}
        </script>
    @endpush
@endonce
