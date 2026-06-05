@once
    @push('roro-select-scripts')
        <script{!! $cspNonce ? ' nonce="'.e($cspNonce).'"' : '' !!}>
            {!! file_get_contents(realpath($getJsPath() . 'RoroFile.min.js')) !!}
            {!! file_get_contents(realpath($getJsPath() . 'file.min.js')) !!}
        </script>
    @endpush
@endonce
